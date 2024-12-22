import { useState, useRef } from 'react';
import { useAddComment } from '@/mutations/xcomment';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiSmile } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';

interface XCommentBoxProps {
  tweetId: number;
  xPassNFTs: any[];
  onCommentAdded?: () => void;
}

export default function XCommentBox({ tweetId, xPassNFTs, onCommentAdded }: XCommentBoxProps) {
  const [comment, setComment] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const { mutate: addComment, isPending } = useAddComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiSelect = (emoji: any) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji.native + text.substring(end);
      setComment(newText);
      // 重新设置光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.native.length;
        textarea.focus();
      }, 0);
    }
    setShowEmoji(false);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    addComment(
      { tweetId, content: comment, xPassNFTs },
      {
        onSuccess: () => {
          setComment('');
          onCommentAdded?.();
        },
      }
    );
  };

  return (
    <div className="relative mt-2 mb-4">
      <div className="flex items-start space-x-2">
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
          >
            <BsEmojiSmile size={20} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !comment.trim()}
            className={`p-2 rounded-full ${
              isPending || !comment.trim()
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <IoSend size={20} />
          </button>
        </div>
      </div>

      {showEmoji && (
        <div className="absolute right-0 mt-2 z-10">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            previewPosition="none"
          />
        </div>
      )}
    </div>
  );
} 