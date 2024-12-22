import { useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CONSTANTS } from "../constants/constants";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { putData } from "@/utils/walrusService";

interface XProfileInfo {
  nickname: string;
  email: string;
  bio: string;
  image: File;
  ipfsNFTHash: string;
}

export function useCreateXProfile() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async (info: XProfileInfo) => {
      if (!account?.address) {
        throw new Error("You need to connect your wallet first pls!");
      }

      const fileContentBuffer = await info.image.arrayBuffer();
      const blob_id = await putData(fileContentBuffer);

      const txb = new Transaction();
      const ipfs_nft_url = `ipfs://${info.ipfsNFTHash}`;

      txb.moveCall({
        target: `${CONSTANTS.SUI_WALRUSX_CONTRACT.TARGET_MINT_PROFILE}`,
        arguments: [
          txb.object(CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID),
          txb.pure.string(info.nickname),
          txb.pure.string(info.email),
          txb.pure.string(info.bio),
          txb.pure.string(blob_id),
          txb.pure.string(ipfs_nft_url),
          txb.object("0x6"),
        ],
      });

      return executeTransaction(txb);
    },
    onError: (error) => {
      console.error("Failed to create XProfile:", error);
      throw error;
    },
    onSuccess: (data) => {
      console.log("Successfully created XProfile:", data);
    },
  });
}