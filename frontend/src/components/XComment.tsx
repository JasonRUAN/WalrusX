import { useState } from "react";
import { useGetTweetComments } from "@/hooks/useGetTweetComments";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiCopy } from "react-icons/fi";

dayjs.extend(relativeTime);

interface XCommentProps {
  tweetIndex: number;
  commentsTableId: string;
}

interface Comment {
  type: string;
  fields: {
    content: string;
    created_at: string;
    id: string;
    owner: string;
    tweet_id: string;
  };
}

export default function XComment({
  tweetIndex,
  commentsTableId,
}: XCommentProps) {
  const [displayCount, setDisplayCount] = useState(3);
  const tweetComments = useGetTweetComments({ tweetIndex, commentsTableId });

  const comments = tweetComments?.data?.content
    ? (tweetComments.data.content as any).fields?.value || []
    : [];

  const hasMoreComments = comments.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 3);
  };

  if (!comments.length) {
    return <div className="text-gray-500 text-sm">No comments yet</div>;
  }

  return (
    <div className="space-y-3">
      {comments
        .slice(0, displayCount)
        .map((comment: Comment, index: number) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span
                className="font-medium text-sm cursor-pointer hover:text-blue-500 relative group"
                onClick={() =>
                  navigator.clipboard.writeText(
                    normalizeSuiAddress(comment.fields.owner),
                  )
                }
                title={normalizeSuiAddress(comment.fields.owner)}
              >
                {`${normalizeSuiAddress(comment.fields.owner).slice(0, 6)}...${normalizeSuiAddress(comment.fields.owner).slice(-4)}`}
                <FiCopy className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-5 top-1/2 -translate-y-1/2" />
              </span>
              <span className="text-gray-500 text-xs flex-1 text-right">
                {dayjs(parseInt(comment.fields.created_at)).fromNow()}
              </span>
            </div>
            <p className="text-sm mt-1">{comment.fields.content}</p>
          </div>
        ))}

      {hasMoreComments && (
        <button
          onClick={handleShowMore}
          className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
        >
          Show more comments
        </button>
      )}
    </div>
  );
}
