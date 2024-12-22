import { DynamicFieldName, SuiObjectResponse } from "@mysten/sui/client";
import Post from "./Post";
import { useGetDynamicFieldObject } from "@/hooks/useGetDynamicFieldObject";
import useGetProfile from "@/hooks/useGetProfile";
import { useGetTweetLikes } from "@/hooks/useGetTweetLikes";
import { useCurrentAccount } from "@mysten/dapp-kit";

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

interface TweetItemProps {
  dynamic_field_name: DynamicFieldName;
  tweetsTableId: string;
  tweetIndex: number;
  likesTableId: string;
  commentsTableId: string;
  xPassNFTs: SuiObjectResponse[];
}

const style = {
  feedContainer: `divide-y divide-[#38444d]`,
};

export function XFeedItem({
  dynamic_field_name,
  tweetsTableId,
  tweetIndex,
  likesTableId,
  commentsTableId,
  xPassNFTs
}: TweetItemProps) {
  const account = useCurrentAccount();
  const tweetData = useGetDynamicFieldObject({ dynamic_field_name, tableId: tweetsTableId });
  const tweetLikes = useGetTweetLikes({
    tweetIndex,
    likesTableId,
  });

  const tweetContent = tweetData?.data?.content ?
    (tweetData.data.content as any).fields?.value?.fields as Tweet :
    undefined;

  const profile = useGetProfile(tweetContent?.owner || '');

  if (!tweetLikes || !tweetData?.data?.content || !tweetContent) {
    return null;
  }

  const likeAddresses = tweetLikes?.data?.content ?
    (tweetLikes.data.content as any).fields?.value?.fields?.contents : [];

  const isLiked = account ? likeAddresses?.includes(account.address) : false;

  const fields = profile?.data?.content?.dataType === "moveObject"
    ? (profile.data.content.fields as any)
    : undefined;

  const ipfsUrl = fields?.value?.fields?.ipfs_nft_url;
  const walletAddress = tweetContent.owner;
  const timestamp = new Date(parseInt(tweetContent.created_at)).toLocaleString();
  const media_blob_id = tweetContent.media_blob_id;

  return (
    <div className={style.feedContainer}>
      <Post
        displayName={fields?.value?.fields?.nickname}
        userName={`${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`}
        text={tweetContent.content}
        avatar={ipfsUrl ? ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/') : `https://avatars.dicebear.com/api/pixel-art/${walletAddress}.svg`}
        isProfileImageNft={!!ipfsUrl}
        timestamp={timestamp}
        media_blob_id={media_blob_id}
        tweetId={tweetIndex}
        isLiked={isLiked}
        likesCount={likeAddresses?.length || 0}
        commentsTableId={commentsTableId}
        xPassNFTs={xPassNFTs}
        owner={walletAddress}
      />
    </div>
  );
}