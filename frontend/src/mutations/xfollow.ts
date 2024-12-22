import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from 'react-hot-toast';
import { CONSTANTS } from "@/constants/constants";

interface FollowUserParams {
  userToFollow: string;
}

export const useFollowUser = () => {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ userToFollow }: FollowUserParams) => {
      if (!userToFollow) {
        toast.error("User address is required");
        throw new Error("User address is required");
      }

      const txb = new Transaction();

      txb.moveCall({
        target: `${CONSTANTS.SUI_WALRUSX_CONTRACT.TARGET_FOLLOW_USER}`,
        arguments: [
          txb.object(CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID),
          txb.pure.address(userToFollow),
        ],
      });

      try {
        const result = await signAndExecuteTransaction({
          transaction: txb,
        });

        toast.success(`Successfully followed user, Transaction digest: ${result.digest}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to follow user: ${errorMessage}`);
        throw error;
      }
    },
  });
};