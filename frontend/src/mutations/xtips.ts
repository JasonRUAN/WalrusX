import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from "react-hot-toast";

interface TipParams {
  amount: number;
  recipientAddress: string;
}

export function useTipTweet() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ amount, recipientAddress }: TipParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      console.log(">>>> account", account);
      console.log(">>>> amount", amount);
      console.log(">>>> recipientAddress", recipientAddress);

      const txb = new Transaction();
      const amountInMist = Math.floor(amount * 1_000_000_000);
      const [coin] = txb.splitCoins(txb.gas, [amountInMist]);
      txb.transferObjects([coin], recipientAddress);

      try {
        const result = await signAndExecuteTransaction({
          transaction: txb,
        });
        toast.success("打赏成功！");
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`打赏失败: ${errorMessage}`);
        throw error;
      }
    },
  });
}