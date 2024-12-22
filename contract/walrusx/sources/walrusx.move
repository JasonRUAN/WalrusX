/// Module: walrusx
module walrusx::walrusx;

use sui::table::{Self, Table};
use sui::vec_set::{Self, VecSet};
use std::string::{Self, String};
use sui::event;
use sui::clock::{Self, Clock};
use walrusx::x_pass_nft::{Self, XPassNFT};

// ====== ErrCodes ======
const ETweetTooLong: u64 = 0;
const ETweetEmpty: u64 = 1;
const ETweetNotFound: u64 = 2;
const EAlreadyLiked: u64 = 3;
const ECannotFollowSelf: u64 = 4;
const EAlreadyFollowing: u64 = 5;
const ECommentTooLong: u64 = 6;
const ECommentEmpty: u64 = 7;
const EAlreadyHasProfile: u64 = 8;

// ====== Constants ======
const MAX_TWEET_LENGTH: u64 = 1024;

// ====== Struct Definitions ======
/// WalrusX is the main storage structure for a decentralized Twitter-like system
/// It contains all tweets, comments, user relationships and other data
public struct WalrusX has key {
    /// Unique identifier for the object
    id: UID,
    /// Counter for generating unique tweet IDs
    tweet_counter: u64,
    /// Counter for generating unique comment IDs
    comment_counter: u64,
    /// Stores all tweets, where key is tweet ID and value is Tweet struct
    tweets: Table<u64, Tweet>,
    /// Stores all tweet IDs posted by users, where key is user address and value is array of tweet IDs
    user_tweets: Table<address, vector<u64>>,
    /// Stores user profile information, where key is user address and value is Profile struct
    user_profile: Table<address, Profile>,
    /// Stores all comments for tweets, where key is tweet ID and value is array of comments
    tweet_comments: Table<u64, vector<Comment>>,
    /// Stores follower relationships, where key is followee address and value is set of follower addresses
    followers: Table<address, VecSet<address>>,
    /// Stores following relationships, where key is follower address and value is set of followee addresses
    following: Table<address, VecSet<address>>,
    /// Stores tweet likes, where key is tweet ID and value is set of addresses who liked the tweet
    tweet_likes: Table<u64, VecSet<address>>,
}

/// Profile struct defines user's personal information
public struct Profile has key, store  {
    /// Unique identifier for the profile object
    id: UID,
    /// Address of the profile owner
    owner: address,
    /// User's display name
    nickname: String,
    /// User's email address
    email: String,
    /// User's personal biography or description
    bio: String,
    /// Blob ID for user's avatar image stored in Walrus
    image_blob_id: String,
    /// URL to user's IPFS NFT
    ipfs_nft_url: String,
    /// Timestamp when the account was created
    created_at: u64,
}

/// Tweet struct defines all properties of a tweet
public struct Tweet has store {
    /// Unique identifier for the tweet
    id: u64,
    /// Address of the tweet author
    owner: address,
    /// Text content of the tweet
    content: String,
    /// Blob ID for media (image/video) stored in Walrus
    media_blob_id: String,
    /// Timestamp when the tweet was created
    created_at: u64,
    /// Number of likes received
    likes: u64,
    /// Number of times the tweet was retweeted
    retweets: u64,
    /// Flag indicating if this tweet is a retweet
    is_retweet: bool,
    /// ID of the original tweet if this is a retweet; 0 if not
    original_tweet_id: u64,
}

/// Comment struct defines all properties of a comment
public struct Comment has store {
    /// Unique identifier for the comment
    id: u64,
    /// ID of the tweet this comment belongs to
    tweet_id: u64,
    /// Address of the comment author
    owner: address,
    /// Text content of the comment
    content: String,
    /// Timestamp when the comment was created
    created_at: u64,
}

// ====== Events ======
public struct TweetCreated has copy, drop {
    tweet_id: u64,
    owner: address,
    content: String,
}

public struct TweetLiked has copy, drop {
    tweet_id: u64,
    liker: address,
}

public struct TweetRetweeted has copy, drop {
    tweet_id: u64,
    retweeter: address,
}

public struct CommentAdded has copy, drop {
    tweet_id: u64,
    comment_id: u64,
    owner: address,
}

public struct Followed has copy, drop {
    follower: address,
    following: address,
}

// ====== Initialization Function ======
fun init(ctx: &mut TxContext) {
    let walrusx = WalrusX {
        id: object::new(ctx),
        tweet_counter: 0,
        comment_counter: 0,
        tweets: table::new(ctx),
        user_tweets: table::new(ctx),
        user_profile: table::new(ctx),
        tweet_comments: table::new(ctx),
        followers: table::new(ctx),
        following: table::new(ctx),
        tweet_likes: table::new(ctx),
    };
    transfer::share_object(walrusx);
}

// ====== Public Interface ======
/// Creates a new user profile and mints an XPassNFT for the user
/// @param walrusx - The WalrusX storage object
/// @param nickname - The display name for the user
/// @param email - The user's email address
/// @param bio - The user's biography/description
/// @param image_blob_id - The blob ID for the user's profile image
/// @param ipfs_nft_url - The IPFS URL for the user's NFT
/// @param clock - The Clock object for timestamp
/// @param ctx - The transaction context
public entry fun mint_profile(
    walrusx: &mut WalrusX,
    nickname: String,
    email: String,
    bio: String,
    image_blob_id: String,
    ipfs_nft_url: String,
    clock: &Clock,
    ctx: &mut TxContext
)  {

    let sender = ctx.sender();

    assert!(!walrusx.user_profile.contains(sender), EAlreadyHasProfile);

    let profile = Profile {
        id: object::new(ctx),
        owner: sender,
        nickname,
        email,
        bio,
        image_blob_id,
        ipfs_nft_url,
        created_at: clock::timestamp_ms(clock),
    };

    walrusx.user_profile.add(sender, profile);

    x_pass_nft::mint(nickname, ipfs_nft_url, ctx);
}

/// Creates a new tweet with optional media attachment
/// Requires the user to have an XPassNFT to post
/// @param _ - The XPassNFT proving ownership
/// @param walrusx - The WalrusX storage object
/// @param content - The text content of the tweet (UTF-8 encoded bytes)
/// @param media_blob_id - The blob ID for attached media (UTF-8 encoded bytes)
/// @param clock - The Clock object for timestamp
/// @param ctx - The transaction context
public entry fun create_tweet(
    _: &XPassNFT,
    walrusx: &mut WalrusX,
    content: vector<u8>,
    media_blob_id: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let content = string::utf8(content);
    assert!(content.length() > 0, ETweetEmpty);
    assert!(content.length() <= MAX_TWEET_LENGTH, ETweetTooLong);

    let media_blob_id = string::utf8(media_blob_id);

    let sender = ctx.sender();
    let tweet_id = walrusx.tweet_counter;
    let tweet = Tweet {
        id: tweet_id,
        owner: sender,
        content,
        media_blob_id,
        created_at: clock::timestamp_ms(clock),
        likes: 0,
        retweets: 0,
        is_retweet: false,
        original_tweet_id: 0,
    };

    walrusx.tweets.add(tweet_id, tweet);

    if (!walrusx.user_tweets.contains(sender)) {
        walrusx.user_tweets.add(sender, vector::empty());
    };

    walrusx.user_tweets[sender].push_back(tweet_id);

    walrusx.tweet_counter = tweet_id + 1;

    event::emit(TweetCreated {
        tweet_id,
        owner: sender,
        content,
    });
}

/// Likes a tweet. A user can only like a tweet once
/// @param walrusx - The WalrusX storage object
/// @param tweet_id - The ID of the tweet to like
/// @param ctx - The transaction context
public entry fun like_tweet(
    walrusx: &mut WalrusX,
    tweet_id: u64,
    ctx: &mut TxContext
) {
    assert!(tweet_id < walrusx.tweet_counter, ETweetNotFound);

    if (!walrusx.tweet_likes.contains(tweet_id)) {
        walrusx.tweet_likes.add(tweet_id, vec_set::empty());
    };

    let sender = ctx.sender();
    let likes_set = &mut walrusx.tweet_likes[tweet_id];
    assert!(!likes_set.contains(&sender), EAlreadyLiked);
    likes_set.insert( sender);

    let tweet = &mut walrusx.tweets[tweet_id];
    tweet.likes = tweet.likes + 1;

    event::emit(TweetLiked {
        tweet_id,
        liker: sender,
    });
}

/// Follows another user. A user cannot follow themselves or follow the same user twice
/// @param walrusx - The WalrusX storage object
/// @param user_to_follow - The address of the user to follow
/// @param ctx - The transaction context
public entry fun follow_user(
    walrusx: &mut WalrusX,
    user_to_follow: address,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(sender != user_to_follow, ECannotFollowSelf);

    if (!walrusx.followers.contains(user_to_follow)) {
        walrusx.followers.add(user_to_follow, vec_set::empty());
    };
    if (!walrusx.following.contains(sender)) {
        walrusx.following.add(sender, vec_set::empty());
    };

    let followers = &mut walrusx.followers[user_to_follow];
    let following = &mut walrusx.following[sender];

    assert!(!following.contains(&user_to_follow), EAlreadyFollowing);

    followers.insert(sender);
    following.insert(user_to_follow);

    event::emit(Followed {
        follower: sender,
        following: user_to_follow,
    });
}

/// Adds a comment to a tweet
/// Requires the user to have an XPassNFT to comment
/// @param _ - The XPassNFT proving ownership
/// @param walrusx - The WalrusX storage object
/// @param tweet_id - The ID of the tweet to comment on
/// @param content - The text content of the comment (UTF-8 encoded bytes)
/// @param clock - The Clock object for timestamp
/// @param ctx - The transaction context
public entry fun add_comment(
    _: &XPassNFT,
    walrusx: &mut WalrusX,
    tweet_id: u64,
    content: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(tweet_id < walrusx.tweet_counter, ETweetNotFound);
    let content = string::utf8(content);
    assert!(content.length() > 0, ECommentEmpty);
    assert!(content.length() <= MAX_TWEET_LENGTH, ECommentTooLong);

    let comment_id = walrusx.comment_counter;
    let comment = Comment {
        id: comment_id,
        tweet_id,
        owner: ctx.sender(),
        content,
        created_at: clock::timestamp_ms(clock),
    };

    if (!walrusx.tweet_comments.contains(tweet_id)) {
        walrusx.tweet_comments.add(tweet_id, vector::empty());
    };

    let comments = &mut walrusx.tweet_comments[tweet_id];
    comments.push_back(comment);

    walrusx.comment_counter = comment_id + 1;

    event::emit(CommentAdded {
        tweet_id,
        comment_id,
        owner: ctx.sender(),
    });
}

/// Retweets an existing tweet
/// Requires the user to have an XPassNFT to retweet
/// @param _ - The XPassNFT proving ownership
/// @param walrusx - The WalrusX storage object
/// @param tweet_id - The ID of the tweet to retweet
/// @param clock - The Clock object for timestamp
/// @param ctx - The transaction context
public entry fun retweet(
    _: &XPassNFT,
    walrusx: &mut WalrusX,
    tweet_id: u64,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(tweet_id < walrusx.tweet_counter, ETweetNotFound);

    // Get the original tweet
    let original_tweet = &walrusx.tweets[tweet_id];

    let sender = ctx.sender();

    // Create new retweet
    let new_tweet_id = walrusx.tweet_counter;
    let tweet = Tweet {
        id: new_tweet_id,
        owner: sender,
        content: original_tweet.content,
        media_blob_id: original_tweet.media_blob_id,
        created_at: clock::timestamp_ms(clock),
        likes: 0,
        retweets: 0,
        is_retweet: true,
        original_tweet_id: tweet_id,
    };

    // Store the new tweet
    walrusx.tweets.add(new_tweet_id, tweet);

    // Update retweet count of original tweet
    let original_tweet = &mut walrusx.tweets[tweet_id];
    original_tweet.retweets = original_tweet.retweets + 1;

    // Add to user's tweet list
    if (!walrusx.user_tweets.contains(sender)) {
        walrusx.user_tweets.add(sender, vector::empty());
    };

    let user_tweets = &mut walrusx.user_tweets[sender];
    user_tweets.push_back(new_tweet_id);

    // Update tweet counter
    walrusx.tweet_counter = new_tweet_id + 1;

    // Emit retweet event
    event::emit(TweetRetweeted {
        tweet_id,
        retweeter: ctx.sender(),
    });
}

// ====== Read-Only Functions ======
/// Gets a tweet by its ID
/// @param walrusx - The WalrusX storage object
/// @param tweet_id - The ID of the tweet to retrieve
/// @return A reference to the Tweet struct
public fun get_tweet(walrusx: &WalrusX, tweet_id: u64): &Tweet {
    assert!(tweet_id < walrusx.tweet_counter, ETweetNotFound);
    &walrusx.tweets[tweet_id]
}

/// Gets all tweet IDs posted by a specific user
/// @param walrusx - The WalrusX storage object
/// @param user - The address of the user
/// @return A vector of tweet IDs
public fun get_user_tweets(walrusx: &WalrusX, user: address): vector<u64> {
    if (!walrusx.user_tweets.contains(user)) {
        return vector::empty()
    };
    walrusx.user_tweets[user]
}

/// Gets all comments for a specific tweet
/// @param walrusx - The WalrusX storage object
/// @param tweet_id - The ID of the tweet
/// @return A reference to the vector of comments
public fun get_tweet_comments(walrusx: &WalrusX, tweet_id: u64): &vector<Comment> {
    assert!(tweet_id < walrusx.tweet_counter, ETweetNotFound);
    if (!walrusx.tweet_comments.contains(tweet_id)) {
        abort ETweetNotFound
    };
    &walrusx.tweet_comments[tweet_id]
}