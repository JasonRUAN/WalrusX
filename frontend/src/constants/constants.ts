/** @ts-ignore */
import typingSpeedContract from "../../typing-speed-contract.json";
import suiWalrusXContract from "../../sui-walrusx-contract.json";

export enum QueryKey {
  GetBalance = "GetBalance",
}

export const CONSTANTS = {
  SUI_WALRUSX_CONTRACT: {
    TARGET_MINT_PROFILE: `${suiWalrusXContract.packageId}::walrusx::mint_profile`,
    TARGET_X_PASS_NFT_MINT: `${suiWalrusXContract.packageId}::x_pass_nft::mint`,
    TARGET_CREATE_TWEET: `${suiWalrusXContract.packageId}::walrusx::create_tweet`,
    TARGET_LIKE_TWEET: `${suiWalrusXContract.packageId}::walrusx::like_tweet`,
    TARGET_FOLLOW_USER: `${suiWalrusXContract.packageId}::walrusx::follow_user`,
    TARGET_ADD_COMMENT: `${suiWalrusXContract.packageId}::walrusx::add_comment`,
    TARGET_RETWEET: `${suiWalrusXContract.packageId}::walrusx::retweet`,
    TARGET_GET_TWEET: `${suiWalrusXContract.packageId}::walrusx::get_tweet`,
    WALRUSX_SHARED_OBJECT_ID: suiWalrusXContract.walrusxSharedObjectId,
    WALRUSX_PROFILE_OBJECT_TYPE: `${suiWalrusXContract.packageId}::walrusx::Profile`,
    WALRUSX_PASSPORT_NFT_OBJECT_TYPE: `${suiWalrusXContract.packageId}::x_pass_nft::XPassNFT`,
    WALRUSX_TWEET_OBJECT_TYPE: `${suiWalrusXContract.packageId}::walrusx::Tweet`,
  },
  WALRUS: {
    PUBLISHER_URL: "https://publisher.walrus-testnet.walrus.space",
    AGGREGATOR_URL: "https://aggregator.walrus-testnet.walrus.space",
  },
  PINATA: {
    API_KEY: import.meta.env.VITE_PINATA_API_KEY,
    API_SECRET: import.meta.env.VITE_PINATA_API_SECRET,
  },
};
