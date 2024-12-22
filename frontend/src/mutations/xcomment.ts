import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from 'react-hot-toast';
import { CONSTANTS } from "@/constants/constants";
import { SuiObjectResponse } from "@mysten/sui/client";

interface AddCommentParams {
  tweetId: number;
  content: string;
  xPassNFTs: SuiObjectResponse[];
}

export const useAddComment = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ tweetId, content, xPassNFTs }: AddCommentParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!xPassNFTs || xPassNFTs.length === 0) {
        toast.error("You need to mint an XPassport NFT to comment");
        throw new Error("No XPassport NFT found");
      }

      const passportNFTObjectId = xPassNFTs[0]?.data?.objectId;

      if (!passportNFTObjectId) {
        toast.error("Failed to get XPassport NFT");
        throw new Error("No XPassport NFT found");
      }

      const txb = new Transaction();

      txb.moveCall({
        target: `${CONSTANTS.SUI_WALRUSX_CONTRACT.TARGET_ADD_COMMENT}`,
        arguments: [
          txb.object(passportNFTObjectId),
          txb.object(CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID),
          txb.pure.u64(tweetId),
          txb.pure.string(content),
          txb.object("0x6"),
        ],
      });

      try {
        const result = await signAndExecuteTransaction({
          transaction: txb,
        });

        toast.success(`Comment added successfully, Transaction digest: ${result.digest}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to add comment: ${errorMessage}`);
        throw error;
      }
    },
  });
};