import { QueryKey } from "@/constants/constants";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CoinBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance: Record<string, unknown>;
}

interface UseGetBalanceResult {
  data: CoinBalance | undefined;
  isPending: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useGetBalance(coinType: string): UseGetBalanceResult {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const queryKey = [QueryKey.GetBalance, coinType];

  const query = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
    },
    {
      enabled: !!account?.address,
      queryKey,
      staleTime: 1000,
      refetchInterval: 2000,
    },
  );

  const refreshMutation = useMutation({
    mutationKey: ['refreshBalance', ...queryKey],
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey });
      await query.refetch();
    },
  });

  return {
    data: query.data,
    isPending: query.isPending,
    error: query.error,
    refresh: async () => {
      await refreshMutation.mutateAsync();
    },
    isRefreshing: refreshMutation.isPending || query.isFetching,
  };
}
