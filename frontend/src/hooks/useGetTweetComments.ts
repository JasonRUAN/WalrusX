import { useGetDynamicFieldObject } from "./useGetDynamicFieldObject";
import { DynamicFieldName } from "@mysten/sui/client";

interface UseGetTweetCommentsParams {
  tweetIndex: number;
  commentsTableId: string;
}

export function useGetTweetComments({ tweetIndex, commentsTableId }: UseGetTweetCommentsParams) {
  const dynamic_field_name: DynamicFieldName = {
    type: "u64",
    value: tweetIndex.toString()
  };

  return useGetDynamicFieldObject({
    dynamic_field_name,
    tableId: commentsTableId
  });
}