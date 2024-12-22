import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Button, Flex, Text, TextArea } from '@radix-ui/themes';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { useCreateXProfile } from '@/mutations/xprofile';
import { toast } from 'react-hot-toast';
import { pinFileToIPFS } from '@/utils/pinata';

interface XProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const XProfile = ({ isOpen, onClose }: XProfileProps) => {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    bio: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [previewNFT, setPreviewNFT] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  const createProfile = useCreateXProfile();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData({
      nickname: '',
      email: '',
      bio: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageFile || !previewNFT) {
      setError('Please upload a profile image and generate NFT preview');
      return;
    }

    if (!formData.nickname || !formData.email || !formData.bio) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(previewNFT);
      const blob = await response.blob();
      const previewFile = new File([blob], 'preview.png', { type: 'image/png' });

      const pinataMetaData = {
        name: `${formData.nickname} - ${formData.email}`,
      };
      const ipfsNFTHash = await pinFileToIPFS(previewFile, pinataMetaData);

      if (!ipfsNFTHash) {
        throw new Error('Failed to upload image to IPFS');
      }

      await createProfile.mutateAsync({
        ...formData,
        // image: imageFile,
        image: previewFile,
        ipfsNFTHash,
      });

      toast.success('Profile created successfully!');
      onClose();

      setFormData({
        nickname: '',
        email: '',
        bio: '',
      });
      setImageFile(null);
      setImagePreview('');
      setPreviewNFT('');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const generateNFTPreview = async () => {
    if (!imageFile) {
      setError('Please upload a profile image');
      return;
    }
    if (!formData.nickname) {
      setError('Please enter your nickname');
      return;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.bio) {
      setError('Please enter your bio');
      return;
    }

    if (!canvasRef.current) return;

    setError('');

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    const gradients = [
      ['#4F46E5', '#7C3AED', '#EC4899'], // 蓝紫粉
      ['#3B82F6', '#10B981', '#F59E0B'], // 蓝绿橙
      ['#8B5CF6', '#EC4899', '#F43F5E'], // 紫粉红
      ['#06B6D4', '#3B82F6', '#8B5CF6'], // 青蓝紫
      ['#F59E0B', '#EF4444', '#EC4899'], // 橙红粉
    ];
    const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width
    );
    gradient.addColorStop(0, selectedGradient[0]);
    gradient.addColorStop(0.5, selectedGradient[1]);
    gradient.addColorStop(1, selectedGradient[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, 30 + i * 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 24px Inter';
    ctx.fillText('WalrusX Passport', canvas.width/2, 40);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.moveTo(canvas.width/2 - 100, 50);
    ctx.lineTo(canvas.width/2 + 100, 50);
    ctx.stroke();

    const img = new Image();
    img.src = imagePreview;
    await new Promise(resolve => {
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        const radius = 60;
        ctx.arc(canvas.width/2, canvas.height/2 - 20, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, canvas.width/2 - radius, canvas.height/2 - radius - 20, radius * 2, radius * 2);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
        resolve(null);
      };
    });

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;

    const centerX = canvas.width/2;

    ctx.font = 'bold 16px Inter';
    ctx.fillText('Name: ' + formData.nickname, centerX, canvas.height/2 + 60);

    ctx.font = 'bold 14px Inter';
    ctx.fillText('Email: ' + formData.email, centerX, canvas.height/2 + 90);

    ctx.font = 'bold 14px Inter';
    ctx.fillText('Bio: ' + formData.bio.slice(0, 30) + (formData.bio.length > 30 ? '...' : ''), centerX, canvas.height/2 + 120);

    setPreviewNFT(canvas.toDataURL());
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 w-[90%] max-w-md shadow-2xl border border-gray-100">
          <Dialog.Close className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <FaTimes className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </Dialog.Close>

          <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-800">
            Create Your XProfile
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Flex direction="column" gap="4">
              {/* Image Upload */}
              <Box className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full rounded-full border-3 border-dashed border-blue-200 bg-blue-50/50 flex items-center justify-center overflow-hidden hover:border-blue-300 transition-colors">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUpload className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Box>

              {/* Form Fields */}
              <Box>
                <Text as="label" size="2" mb="2" weight="medium" className="text-gray-700">
                  Nickname
                </Text>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your nickname"
                  value={formData.nickname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, nickname: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="2" weight="medium" className="text-gray-700">
                  Email
                </Text>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="2" weight="medium" className="text-gray-700">
                  Bio
                </Text>
                <TextArea
                  className="w-full min-h-[100px] px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50 resize-none text-gray-800 placeholder-gray-400"
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </Box>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {previewNFT && (
                <Box className="mt-4">
                  <img src={previewNFT} alt="NFT Preview" className="rounded-lg shadow-lg mx-auto" />
                </Box>
              )}

              {/* Buttons */}
              <Flex gap="6" mt="12" justify="center" className="pt-4 border-t border-gray-100">
                <Button 
                  variant="solid" 
                  color="red" 
                  onClick={handleReset}
                  type="button"
                  className="px-8 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={createProfile.isPending}
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  onClick={generateNFTPreview}
                  className="px-8 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Preview NFT
                </Button>

                <Button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createProfile.isPending}
                >
                  {createProfile.isPending ? 'Minting...' : 'Mint Profile'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default XProfile;
