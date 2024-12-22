export const walrusStore = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("walrus store result", JSON.stringify(result));

    let blobId = "";
    if (result.alreadyCertified) {
      blobId = result.alreadyCertified.blobId;
    } else if (result.newlyCreated) {
      blobId = result.newlyCreated.blobObject.blobId;
    } else {
      throw new Error("Response does not contain expected bolbId");
    }

    return blobId;
  } catch (error) {
    console.error("Walrus store error:", error);
    throw error;
  }
};
