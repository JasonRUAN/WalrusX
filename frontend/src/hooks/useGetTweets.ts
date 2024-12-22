import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

export function useGetTweetObjects(tweetsTableId?: string) {
    const account = useCurrentAccount();

    const {
        data: tweetObjects,
        isPending,
        error,
    } = useSuiClientQuery(
      "getDynamicFields",
      {
        parentId: tweetsTableId!,
      },
      {
        enabled: !!account && !!tweetsTableId,
      }
    );

    // if (!account) {
    //   toast.error("connect wallet first pls.");
    //   return;
    // }

    if (error) {
      // toast.error(`get tweets objects failed: ${error.message}`);
      return;
    }

    if (isPending || !tweetObjects) {
      // toast.error("loading data...");
      return;
    }

    return tweetObjects;
}