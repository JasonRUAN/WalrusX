import { CONSTANTS } from "@/constants/constants";
import { useGetObject } from "./useGetObject";
import { useGetDynamicFields } from "./useGetDynamicFields";
import { useGetDynamicFieldObject } from "./useGetDynamicFieldObject";

export default function useGetProfile(address: string | undefined) {
  const { data: sharedObject } = useGetObject({
    objectId: CONSTANTS.SUI_WALRUSX_CONTRACT.WALRUSX_SHARED_OBJECT_ID,
  });

  const profileTableId =
    sharedObject?.data?.content?.dataType === "moveObject"
      ? (
          sharedObject.data.content.fields as {
            user_profile?: { fields: { id: { id: string } } };
          }
        )?.user_profile?.fields?.id?.id
      : undefined;

  const profileDynamicFields = useGetDynamicFields(profileTableId);
  const profileDynamicFieldObject = useGetDynamicFieldObject({
    dynamic_field_name: {
        type: 'address',
        value: address!,
    },
    tableId: profileTableId ?? '',
  });

  if (!address || !profileTableId || !profileDynamicFields?.data) {
    return null;
  }

  return profileDynamicFieldObject;
}
