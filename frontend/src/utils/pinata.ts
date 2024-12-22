const key = import.meta.env.VITE_PINATA_API_KEY;
const secret = import.meta.env.VITE_PINATA_API_SECRET;

if (!key || !secret) {
  throw new Error('Pinata API key or secret is missing');
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

export const pinJSONToIPFS = async (json: Record<string, any>): Promise<string | undefined> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  try {
    const headers = {
      'Content-Type': 'application/json',
      pinata_api_key: key,
      pinata_secret_api_key: secret,
    } as const;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(json)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PinataResponse = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const pinFileToIPFS = async (file: File, pinataMetaData: PinataMetadata): Promise<string | undefined> => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append('file', file);
  data.append('pinataMetadata', JSON.stringify(pinataMetaData));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
      body: data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: PinataResponse = await response.json();
    return responseData.IpfsHash;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
