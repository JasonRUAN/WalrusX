import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import toast from "react-hot-toast";

export function useGetDynamicFields(tableId?: string) {
    const account = useCurrentAccount();

    const {
        data: dynamicFields,
        isPending,
        error,
    } = useSuiClientQuery(
      "getDynamicFields",
      {
        parentId: tableId!,
      },
      {
        enabled: !!account && !!tableId,
      }
    );

    // if (!account) {
    //   toast.error("connect wallet first pls.");
    //   return;
    // }

    if (error) {
      toast.error(`get dynamic fields failed: ${error.message}`);
      return;
    }

    if (isPending || !dynamicFields) {
      // toast.error("loading data...");
      // console.error("loading data...");
      return;
    }

    return dynamicFields;
}