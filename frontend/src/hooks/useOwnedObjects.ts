import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';

interface UseOwnedObjectsProps {
  structType?: string;
}

export function useOwnedObjects({ structType }: UseOwnedObjectsProps = {}) {
  const account = useCurrentAccount();

  const {
    data,
    isPending,
    error,
    refetch
  } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address as string,
    filter: structType ? {
      StructType: structType,
    } : undefined,
    options: {
      showType: true,
      showContent: true,
      showDisplay: true,
    }
  }, {
    enabled: !!account,
    refetchInterval: 1000, // 每5秒自动刷新一次
  });

  return {
    objects: (data?.data || []) as SuiObjectResponse[],
    isPending,
    error,
    refetch,
  };
}
