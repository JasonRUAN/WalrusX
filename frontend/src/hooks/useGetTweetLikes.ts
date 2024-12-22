import { useGetDynamicFieldObject } from "./useGetDynamicFieldObject";
import { DynamicFieldName } from "@mysten/sui/client";

interface UseGetTweetLikesParams {
  tweetIndex: number;
  likesTableId: string;
}

export function useGetTweetLikes({ tweetIndex, likesTableId }: UseGetTweetLikesParams) {
  const dynamic_field_name: DynamicFieldName = {
    type: "u64",
    value: tweetIndex.toString()
  };

  return useGetDynamicFieldObject({
    dynamic_field_name,
    tableId: likesTableId
  });
}