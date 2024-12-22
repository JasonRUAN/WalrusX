import { BsFillPatchCheckFill } from 'react-icons/bs'
import { FaRegComment, FaRetweet } from 'react-icons/fa'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { FiShare } from 'react-icons/fi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CONSTANTS } from '@/constants/constants'
import { useState, useRef } from 'react'
import { useLikeTweet } from '@/mutations/xlike'
import XComment from './XComment'
import XCommentBox from './XCommentBox'
import { useRetweet } from '@/mutations/xretweet'
import { toast } from 'react-hot-toast'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useGetBalance } from '@/hooks/useGetBalance';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { TipModal } from './TipModal';
import { useTipTweet } from '@/mutations/xtips';

dayjs.extend(relativeTime)

const style = {
  wrapper: `flex p-3 border-b border-[#38444d] hover:bg-[#f5f5f5] transition-colors duration-200`,
  profileImage: `rounded-full h-[40px] w-[40px] object-cover flex-shrink-0`,
  postMain: `flex-1 px-4 max-w-full min-w-0`,
  headerDetails: `flex items-center`,
  name: `font-bold mr-1 truncate`,
  verified: `text-[0.8rem] flex-shrink-0`,
  handleAndTimeAgo: `text-[#8899a6] ml-1 truncate`,
  tweet: `my-2 break-words`,
  image: `rounded-3xl`,
  footer: `flex justify-between mr-28 mt-4 text-[#8899a6]`,
  footerIcon: `rounded-full text-lg p-2`,
}

interface PostProps {
  displayName: string;
  userName: string;
  text: string;
  avatar: string;
  timestamp: string | number;
  isProfileImageNft: boolean;
  media_blob_id?: string;
  tweetId: number;
  isLiked: boolean;
  likesCount: number;
  commentsTableId: string;
  xPassNFTs: any[];
  defaultShowComments?: boolean;
  owner: string;
}

const Post: React.FC<PostProps> = ({
  displayName,
  userName,
  text,
  avatar,
  timestamp,
  isProfileImageNft,
  media_blob_id,
  tweetId,
  isLiked: initialIsLiked,
  likesCount: initialLikesCount,
  commentsTableId,
  xPassNFTs,
  defaultShowComments = false,
  owner,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const { mutate: likeTweet } = useLikeTweet();
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const { mutate: retweet, isPending: isRetweeting } = useRetweet();
  const account = useCurrentAccount();
  const { data: balance } = useGetBalance(account?.address || '');
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const tipButtonRef = useRef<HTMLDivElement>(null);
  const { mutate: tip } = useTipTweet();

  const handleLike = async () => {
    try {
      likeTweet({ tweetId });
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    } catch (error) {
      setIsLiked(false);
    }
  };

  const handleRetweet = async () => {
    try {
      retweet(
        { tweetId, xPassNFTs },
        {
          onSuccess: () => {
            toast.success('Successfully retweeted!');
          },
        }
      );
    } catch (error) {
      console.error('Retweet failed:', error);
    }
  };

  const handlePostClick = (e: React.MouseEvent) => {
    const isInteractiveElement = (e.target as HTMLElement).closest('.interactive-element');
    const isCommentSection = (e.target as HTMLElement).closest('.comment-section');
    const isDialog = (e.target as HTMLElement).closest('[role="dialog"]');

    if (!isInteractiveElement && !isCommentSection && !isDialog) {
      navigate(`/post/${tweetId}`);
    }
  };

  const handleTip = async () => {
    try {
      if (!account) {
        toast.error('Please connect your wallet first');
        return;
      }

      const suiBalance = Number(balance?.totalBalance) || 0;
      if (suiBalance <= 0) {
        toast.error('Insufficient SUI balance');
        return;
      }

      setIsTipModalOpen(true);
    } catch (error) {
      console.error('Tip failed:', error);
      toast.error('Failed to send tip');
    }
  };

  const handleTipConfirm = async (amount: number) => {
    try {
      await tip({
        amount,
        recipientAddress: owner
      });
      setIsTipModalOpen(false);
    } catch (error) {
      console.error('Tip failed:', error);
    }
  };

  return (
    <div 
      className={`${style.wrapper} cursor-pointer`}
      onClick={handlePostClick}
    >
      <div className="interactive-element">
        <img
          src={avatar}
          alt={userName}
          className={
            isProfileImageNft
              ? `${style.profileImage} smallHex`
              : style.profileImage
          }
        />
      </div>
      <div className={style.postMain}>
        <div className="max-w-full">
          <span className={style.headerDetails}>
            <span className={style.name}>{displayName}</span>
            {isProfileImageNft && (
              <span className={style.verified}>
                <BsFillPatchCheckFill />
              </span>
            )}
            <span className={style.handleAndTimeAgo}>
              @{userName} • {dayjs(timestamp).fromNow()}
            </span>
          </span>
          <div className={style.tweet}>{text}</div>
          {media_blob_id && (
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={`${CONSTANTS.WALRUS.AGGREGATOR_URL}/v1/${media_blob_id}`}
                alt="Tweet media"
                className={style.image}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <div className={style.footer}>
          <div
            className={`${style.footerIcon} hover:bg-[#e8f5fe] hover:text-[#1da1f2] interactive-element`}
            onClick={() => setIsCommentBoxOpen(!isCommentBoxOpen)}
          >
            <FaRegComment />
          </div>
          <div
            className={`${style.footerIcon} hover:bg-[#e5f8ef] hover:text-[#17bf63] cursor-pointer interactive-element
              ${isRetweeting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleRetweet}
          >
            <FaRetweet />
          </div>
          <div
            className={`${style.footerIcon} hover:bg-[#fee7ef] hover:text-[#e0245e] cursor-pointer interactive-element
              ${isLiked ? 'text-[#e0245e]' : ''}`}
            onClick={handleLike}
          >
            <div className="flex items-center gap-1">
              {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
              {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
            </div>
          </div>
          <div
            className={`${style.footerIcon} hover:bg-[#e8f5fe] hover:text-[#1da1f2] interactive-element`}
          >
            <FiShare />
          </div>
          <div className="relative z-40">
            <div
              ref={tipButtonRef}
              className={`${style.footerIcon} hover:bg-[#e8f5fe] hover:text-green-500 interactive-element`}
              onClick={handleTip}
            >
              <img
                src="/images/sui-sui-logo.svg"
                alt="Tip with SUI"
                className="w-5 h-5"
              />
            </div>
            <TipModal
              isOpen={isTipModalOpen}
              onClose={() => setIsTipModalOpen(false)}
              onConfirm={handleTipConfirm}
              balance={Number(balance?.totalBalance) || 0}
              buttonRef={tipButtonRef}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 interactive-element"
          >
            <span className="flex items-center gap-1">
              {showComments ? (
                <>
                  <span className="font-medium">
                    Hide Comments
                  </span>
                  <MdKeyboardArrowUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span className="font-medium">
                    Show Comments
                  </span>
                  <MdKeyboardArrowDown className="w-4 h-4" />
                </>
              )}
            </span>
          </button>
        </div>

        {isCommentBoxOpen && (
          <div className="comment-section">
            <XCommentBox
              tweetId={tweetId}
              xPassNFTs={xPassNFTs}
              onCommentAdded={() => {
                setIsCommentBoxOpen(false);
              }}
            />
          </div>
        )}

        {showComments && (
          <div className="mt-4 comment-section">
            <XComment
              tweetIndex={tweetId}
              commentsTableId={commentsTableId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Post
