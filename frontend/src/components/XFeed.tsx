import XBox from "./XBox";
import { DynamicFieldPage, SuiObjectResponse } from "@mysten/sui/client";
import { XFeedItem } from "./XFeedItem";
import { useSuiClientQuery } from "@mysten/dapp-kit";

export interface TweetListProps {
  dynamic_field_page: DynamicFieldPage;
  tweetsTableId: string;
  likesTableId: string;
  commentsTableId: string;
  xPassNFTs: SuiObjectResponse[];
}

const XFeed = ({ dynamic_field_page, tweetsTableId, likesTableId, commentsTableId, xPassNFTs }: TweetListProps) => {
  const { refetch } = useSuiClientQuery(
    "getDynamicFields",
    {
      parentId: tweetsTableId,
    },
    {
      refetchInterval: 1000,
    },
  );

  const handleRefresh = () => {
    refetch();
  };

  if (!dynamic_field_page?.data?.length) {
    return (
      <div>
        <XBox onPostSuccess={handleRefresh} />
        <div className="text-center text-gray-500 mt-4">
          No tweets yet
        </div>
      </div>
    );
  }

  const tweetsWithIndex = dynamic_field_page.data.map((tweet, index) => ({
    ...tweet,
    originalIndex: index
  }));

  const sortedTweets = [...tweetsWithIndex].sort((a, b) => {
    const valueA = parseInt(a.name.value as string);
    const valueB = parseInt(b.name.value as string);
    return valueB - valueA;
  });

  return (
    <div>
      <XBox onPostSuccess={handleRefresh} />
      {sortedTweets.map((tweet) => (
        <XFeedItem
          key={tweet.objectId}
          dynamic_field_name={tweet.name}
          tweetsTableId={tweetsTableId}
          tweetIndex={parseInt(tweet.name.value as string)}
          likesTableId={likesTableId}
          commentsTableId={commentsTableId}
          xPassNFTs={xPassNFTs}
        />
      ))}
    </div>
  );
};

export default XFeed;
