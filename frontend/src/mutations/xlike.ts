import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from 'react-hot-toast';
import { CONSTANTS } from "@/constants/constants";

interface LikeTweetParams {
  tweetId: number;
}

export const useLikeTweet = () => {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ tweetId }: LikeTweetParams) => {
      if (tweetId < 0) {
        toast.error("Tweet ID is required");
        throw new Error("Tweet ID is required");
      }

      const txb = new Transaction();

      txb.moveCall({
        target: `${CONSTANTS.SUI_WALRUSX_CONTRACT.TARGET_LIKE_TWEET}`,
        arguments: [
          txb.object(CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID),
          txb.pure.u64(tweetId),
        ],
      });

      try {
        const result = await signAndExecuteTransaction({
          transaction: txb,
        });

        toast.success(`Tweet liked successfully, Transaction digest: ${result.digest}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to like tweet: ${errorMessage}`);
        throw error;
      }
    },
  });
};