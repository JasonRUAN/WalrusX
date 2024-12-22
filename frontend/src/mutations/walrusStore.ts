import { useMutation } from "@tanstack/react-query";
import { walrusStore } from "@/utils/walrusUtils";
import toast from "react-hot-toast";

export function useWalrusStore() {
  return useMutation({
    mutationFn: async (file: File) => {
      try {
        const result = await walrusStore(file);
        return result;
      } catch (error) {
        console.error('Walrus store error:', error);
        throw error;
      }
    },
    onSuccess: (cid) => {
      toast.success("File uploaded successfully");
      console.log('Upload result CID:', cid);
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    }
  });
}