import { useState, useRef, useMemo } from "react";
import { BsCardImage } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedObjects } from "@/hooks/useOwnedObjects";
import { CONSTANTS } from "@/constants/constants";
import { toast } from "sonner";
import { putData } from "@/utils/walrusService";
import { useCreateTweet } from "@/mutations/twitter";
import useGetProfileTableId from "@/hooks/useGetProfileTableId";
import { useGetDynamicFieldObject } from "@/hooks/useGetDynamicFieldObject";

const style = {
  wrapper: `px-4 flex flex-row border-b border-gray-200 pb-4`,
  boxLeft: `mr-4`,
  boxRight: `flex-1`,
  profileImage: `h-12 w-12 rounded-full object-cover`,
  inputField: `w-full h-full outline-none bg-transparent text-lg border-b border-gray-200 p-2`,
  formLowerContainer: `flex mt-4`,
  iconsContainer: `text-blue-500 flex flex-1 items-center`,
  icon: `mr-2 cursor-pointer hover:text-blue-600 transition-colors`,
  submitGeneral: `px-6 py-2 rounded-3xl font-bold transition-colors`,
  inactiveSubmit: `bg-blue-300 text-white cursor-not-allowed`,
  activeSubmit: `bg-blue-500 text-white hover:bg-blue-600`,
  imagePreview: `mt-4 relative rounded-lg overflow-hidden`,
  imagePreviewImg: `w-full h-48 object-cover`,
  imagePreviewCloseBtn: `absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70`,
};

interface XBoxProps {
  onPostSuccess?: () => void;
}

const MAX_TWEET_LENGTH = 280;

const XBox = ({ onPostSuccess }: XBoxProps) => {
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const account = useCurrentAccount();
  const createTweetMutation = useCreateTweet();

  const { objects: xPassNFTs } = useOwnedObjects({
    structType: CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_PASSPORT_NFT_OBJECT_TYPE,
  });

  const profileTableId = useGetProfileTableId();

  const profileDynamicFieldObject = useGetDynamicFieldObject({
    dynamic_field_name: {
      type: "address",
      value: account?.address ?? "",
    },
    tableId: profileTableId ?? "",
  });

  const profile = useMemo(() => {
    return profileDynamicFieldObject;
  }, [profileDynamicFieldObject]);

  const { fields, ipfsUrl } = useMemo(() => {
    const fields = profile?.data?.content?.dataType === "moveObject"
      ? (profile.data.content.fields as any)
      : undefined;

    const ipfsUrl = fields?.value?.fields?.ipfs_nft_url;

    return { fields, ipfsUrl };
  }, [profile]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and GIF images are allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message && !selectedImage) return;
    
    if (message.length > MAX_TWEET_LENGTH) {
      toast.error("Tweet cannot exceed 280 characters");
      return;
    }

    // Check if XPassport NFT exists
    if (!xPassNFTs || xPassNFTs.length === 0) {
      toast.error("You need to mint an XPassport NFT to create a tweet");
      return;
    }

    setIsPosting(true);
    try {
      // Upload image to Walrus if selected
      let uploadedBlobId: string | undefined;
      if (selectedImage) {
        const fileBuffer = await selectedImage.arrayBuffer();
        uploadedBlobId = await putData(fileBuffer);

        if (!uploadedBlobId) {
          toast.error("Failed to upload image to Walrus");
          return;
        }

        console.log("Uploaded Image Blob ID:", uploadedBlobId);
      }

      console.log(">>>>>> Uploaded Image Blob ID:", uploadedBlobId);

      // Create tweet
      await createTweetMutation.mutateAsync({
        content: message,
        mediaBlobId: uploadedBlobId || "",
        xPassNFTs: xPassNFTs,
      });

      // Reset form after successful post
      setMessage("");
      removeImage();

      onPostSuccess?.();
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    setIsOverLimit(newMessage.length > MAX_TWEET_LENGTH);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.boxLeft}>
        {fields ? (
          <img
            src={ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
            alt="Profile NFT"
            className={style.profileImage}
          />
        ) : (
          <div className={`${style.profileImage} bg-gray-200`} />
        )}
      </div>
      <div className={style.boxRight}>
        <form onSubmit={handlePost}>
          <textarea
            className={`${style.inputField} ${
              isOverLimit ? 'border-red-500' : ''
            }`}
            placeholder="What's happening?"
            value={message}
            onChange={handleMessageChange}
            rows={3}
          />
          <div className={`text-right text-sm mt-1 ${
            isOverLimit ? 'text-red-500' : 'text-gray-500'
          }`}>
            {message.length}/{MAX_TWEET_LENGTH}
          </div>
          {imagePreview && (
            <div className={style.imagePreview}>
              <img
                src={imagePreview}
                alt="Preview"
                className={style.imagePreviewImg}
              />
              <button
                type="button"
                onClick={removeImage}
                className={style.imagePreviewCloseBtn}
              >
                <MdClose size={20} />
              </button>
            </div>
          )}
          <div className={style.formLowerContainer}>
            <div className={style.iconsContainer}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <BsCardImage
                  className={`${style.icon} cursor-pointer`}
                  title="Upload Image"
                />
              </label>
              {/* <RiFileGifLine className={style.icon} />
              <RiBarChartHorizontalFill className={style.icon} />
              <BsEmojiSmile className={style.icon} />
              <IoMdCalendar className={style.icon} />
              <MdOutlineLocationOn className={style.icon} /> */}
            </div>
            <button
              type="submit"
              disabled={
                (!message && !selectedImage) ||
                isPosting ||
                !xPassNFTs ||
                xPassNFTs.length === 0
              }
              className={`${style.submitGeneral} ${
                (message || selectedImage) &&
                !isPosting &&
                xPassNFTs &&
                xPassNFTs.length > 0
                  ? style.activeSubmit
                  : style.inactiveSubmit
              }`}
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default XBox;
