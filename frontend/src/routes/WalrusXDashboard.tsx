import XFeed from '@/components/XFeed';
import { CONSTANTS } from '@/constants/constants';
import { useGetObject } from '@/hooks/useGetObject';
import { useGetTweetObjects } from '@/hooks/useGetTweets';
import { useOwnedObjects } from '@/hooks/useOwnedObjects';
import { getTableId } from "@/utils/suiUtils";

export default function WalrusXDashboard() {

  const { data: sharedObject} = useGetObject({
    objectId: CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID
  })

  const tweetsTableId = getTableId(sharedObject, "tweets");
  const likesTableId = getTableId(sharedObject, "tweet_likes");
  const commentsTableId = getTableId(sharedObject, "tweet_comments");

  const tweetObjects = useGetTweetObjects(tweetsTableId)

  const { objects: xPassNFTs } = useOwnedObjects({
    structType: CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_PASSPORT_NFT_OBJECT_TYPE,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white shadow-md rounded-lg">
        <div className="w-full h-32 overflow-hidden rounded-t-lg">
          <img
            src="/images/banner.jpeg"
            alt="WalrusX Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-4">
          <XFeed dynamic_field_page={tweetObjects!}
            tweetsTableId={tweetsTableId!}
            likesTableId={likesTableId!}
            commentsTableId={commentsTableId!}
            xPassNFTs={xPassNFTs}
          />
        </div>
      </div>
    </div>
  )
}
