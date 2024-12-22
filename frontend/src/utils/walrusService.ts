import { CONSTANTS } from "../constants/constants";

export const putData = async (data: string | ArrayBuffer): Promise<string> => {
  try {
    const response = await fetch(CONSTANTS.WALRUS.PUBLISHER_URL + "/v1/store?epochs=100", {
      method: "PUT",
      body: data instanceof ArrayBuffer ? data : data,
    });

    if (data instanceof ArrayBuffer) {
      console.log("Binary data length:", data.byteLength);
    } else {
      console.log("Text data length:", data.length);
    }

    const jsonResponse = await response.json();

    let blobId = "";

    if (jsonResponse.alreadyCertified) {
      blobId = jsonResponse.alreadyCertified.blobId;
    } else if (jsonResponse.newlyCreated) {
      blobId = jsonResponse.newlyCreated.blobObject.blobId;
    } else {
      throw new Error("Response does not contain expected bolbId");
    }

    return blobId;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getData = async (blob_id: string): Promise<string> => {
  try {
    const response = await fetch(
      CONSTANTS.WALRUS.AGGREGATOR_URL + `/v1/${blob_id}`,
      {
        method: "GET",
      },
    );
    return await response.text();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
