import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { DynamicFieldName} from "@mysten/sui/client";

interface FieldItemProps {
  dynamic_field_name: DynamicFieldName;
  tableId: string;
}

export function useGetDynamicFieldObject({ dynamic_field_name, tableId }: FieldItemProps) {
    const account = useCurrentAccount();

    const { data: dynamicFieldData, isLoading, error } = useSuiClientQuery(
      "getDynamicFieldObject",
      {
        parentId: tableId,
        name: {
          type: dynamic_field_name.type,
          value: dynamic_field_name.value,
        },
      },
      {
        enabled: !!account && !!tableId && !!dynamic_field_name,
        refetchInterval: 1000,
      },
    );

    // if (!account) {
    //   toast.error("connect wallet first pls.");
    //   return;
    // }

    if (error) {
      // toast.error(`get dynamic fields failed: ${error.message}`);
      return;
    }

    if (isLoading || !dynamicFieldData) {
      // toast.error("loading data...");
      return;
    }

    return dynamicFieldData;
}