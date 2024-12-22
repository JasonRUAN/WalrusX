import { CONSTANTS } from "@/constants/constants";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { useTransactionExecution } from "./useTransactionExecution";

interface Tweet {
  id: number;
  author: string;
  content: string;
  media_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  retweets_count: number;
}

export const useGetTweet = async (tweetId: number): Promise<Tweet | null> => {
  const executeTransaction = useTransactionExecution();

  const txb = new Transaction();
  txb.moveCall({
    target: `${CONSTANTS.SUI_WALRUSX_CONTRACT.TARGET_GET_TWEET}`,
    arguments: [
      txb.object(CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID),
      txb.pure.u64(tweetId),
    ],
  });

  try {
    const result = await executeTransaction(txb);

    // 解析返回的数据
    const returnValues = result.effects?.returnValues?.[0];
    if (!returnValues) {
      return null;
    }

    const tweetData = returnValues.fields;

    return {
      id: Number(tweetId),
      author: normalizeSuiAddress(tweetData.author),
      content: tweetData.content,
      media_url: tweetData.media_url,
      created_at: tweetData.created_at,
      likes_count: Number(tweetData.likes_count),
      comments_count: Number(tweetData.comments_count),
      retweets_count: Number(tweetData.retweets_count),
    };
  } catch (error) {
    console.error("Error fetching tweet:", error);
    return null;
  }
};
