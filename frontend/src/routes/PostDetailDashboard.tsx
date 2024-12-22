import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useGetDynamicFieldObject } from '@/hooks/useGetDynamicFieldObject';
import useGetProfile from '@/hooks/useGetProfile';
import { useGetTweetLikes } from '@/hooks/useGetTweetLikes';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Post from '@/components/Post';
import { CONSTANTS } from '@/constants/constants';
import { DynamicFieldName } from '@mysten/sui/client';
import { getTableId } from "@/utils/suiUtils";
import { useGetObject } from '@/hooks/useGetObject';

interface Tweet {
  content: string;
  created_at: string;
  id: string;
  is_retweet: boolean;
  likes: string;
  media_blob_id: string;
  original_tweet_id: string;
  owner: string;
  retweets: string;
}

export function PostDetailDashboard() {
  const navigate = useNavigate();
  const { tweetId } = useParams();
  const account = useCurrentAccount();

  const { data: sharedObject} = useGetObject({
    objectId: CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID
  })

  // 构造动态字段名
  const dynamic_field_name: DynamicFieldName = {
    type: "u64",
    value: tweetId || "0"
  };

  const tweetsTableId = getTableId(sharedObject, "tweets");
  const likesTableId = getTableId(sharedObject, "tweet_likes");
  const commentsTableId = getTableId(sharedObject, "tweet_comments");


  // 获取推文数据
  const tweetData = useGetDynamicFieldObject({
    dynamic_field_name,
    tableId: tweetsTableId!
  });

  // 获取点赞数据
  const tweetLikes = useGetTweetLikes({
    tweetIndex: Number(tweetId),
    likesTableId: likesTableId!
  });

  const tweetContent = tweetData?.data?.content ?
    (tweetData.data.content as any).fields?.value?.fields as Tweet :
    undefined;

  // 获取作者信息
  const profile = useGetProfile(tweetContent?.owner);

  if (!tweetContent) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const fields = profile?.data?.content?.dataType === "moveObject"
    ? (profile.data.content.fields as any)
    : undefined;

  const likeAddresses = tweetLikes?.data?.content ?
    (tweetLikes.data.content as any).fields?.value?.fields?.contents : [];

  const isLiked = account ? likeAddresses?.includes(account.address) : false;

  const ipfsUrl = fields?.value?.fields?.ipfs_nft_url;
  const walletAddress = tweetContent.owner;
  const timestamp = new Date(parseInt(tweetContent.created_at)).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto pt-4">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <Post
        displayName={fields?.value?.fields?.nickname}
        userName={`${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`}
        text={tweetContent.content}
        avatar={ipfsUrl ? ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/') : `https://avatars.dicebear.com/api/pixel-art/${walletAddress}.svg`}
        isProfileImageNft={!!ipfsUrl}
        timestamp={timestamp}
        media_blob_id={tweetContent.media_blob_id}
        tweetId={Number(tweetId)}
        isLiked={isLiked}
        likesCount={likeAddresses?.length || 0}
        commentsTableId={commentsTableId!}
        xPassNFTs={[]}
        defaultShowComments={true}
      />
    </div>
  );
}