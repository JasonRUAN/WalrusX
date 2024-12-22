import { CONSTANTS } from "@/constants/constants";
import { useGetObject } from "./useGetObject";

export default function useGetProfileTableId() {
  const {
    data: sharedObject,
  } = useGetObject({
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

    return profileTableId;
}
