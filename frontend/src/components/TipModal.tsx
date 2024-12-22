import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  balance: number;
  buttonRef: React.RefObject<HTMLDivElement>;
}

export function TipModal({ isOpen, onClose, onConfirm, balance, buttonRef }: TipModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.right - 240
      });
    }
  }, [isOpen]);

  const formatBalance = (balance: number) => {
    return (balance / 1_000_000_000).toFixed(4);
  };

  const handleSubmit = () => {
    const tipAmount = Number(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (tipAmount > Number(formatBalance(balance))) {
      setError('Insufficient balance');
      return;
    }
    onConfirm(tipAmount);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content 
          className="fixed bg-white rounded-lg p-4 w-[240px] shadow-lg z-[100]"
          style={{
            top: position.top,
            left: position.left
          }}
        >
          <div className="text-base font-medium mb-3 text-black">
            请输入<span className="text-blue-500">打赏</span>金额
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-2">Your Balance: {formatBalance(balance)} SUI</p>
            <div className="relative w-full">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('.') && value.split('.')[1].length > 2) {
                    return;
                  }
                  setAmount(value);
                  setError('');
                }}
                step="0.01"
                min="0"
                placeholder="Enter amount"
                className="w-full px-2 py-1.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black text-sm"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                SUI
              </span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 