export async function faucet(address: string) {
  try {
    const response = await fetch('https://faucet.testnet.sui.io/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Faucet request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Faucet response:', data);
    return data;
  } catch (error) {
    console.error('Faucet error:', error);
    throw error;
  }
}

interface TableField {
  fields: {
    id: {
      id: string;
    };
  };
}

interface SharedObjectFields {
  tweets?: TableField;
  tweet_likes?: TableField;
  tweet_comments?: TableField;
}

export const getTableId = (
  sharedObject: any,
  fieldName: keyof SharedObjectFields
): string | undefined => {
  return sharedObject?.data?.content?.dataType === "moveObject"
    ? (sharedObject.data.content.fields as SharedObjectFields)?.[fieldName]?.fields?.id?.id
    : undefined;
};