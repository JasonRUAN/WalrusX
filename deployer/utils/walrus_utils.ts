import { CONFIG } from "./config";
import { readFileSync } from 'fs';

export const putData = async (data: string | Buffer): Promise<string> => {
  try {
    const response = await fetch(CONFIG.PUBLISHER_URL + "/v1/store", {
      method: "PUT",
      body: data,
    });

    const jsonResponse = await response.json();
    console.log("Response:", JSON.stringify(jsonResponse));

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

export const putDataFile = async (filePath: string): Promise<string> => {
  try {
    const fileContent = readFileSync(filePath);
    // Write the file content to a temporary file for debugging
    // const fs = require('fs');
    // fs.writeFileSync('xxx.png', fileContent);
    // console.log('File content written to xxx.png');

    return await putData(fileContent);
  } catch (error) {
    console.error(`Error reading or storing file ${filePath}:`, error);
    throw error;
  }
};
