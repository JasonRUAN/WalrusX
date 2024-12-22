import { ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { NavLink } from "react-router-dom";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaBookOpen,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import XProfile from "./XProfile";
import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import useGetProfileTableId from "@/hooks/useGetProfileTableId";
import { useGetDynamicFieldObject } from "@/hooks/useGetDynamicFieldObject";

const menu = [
  {
    title: "Home",
    link: "/home",
  },
];

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const address = useCurrentAccount();

  const profileTableId = useGetProfileTableId();

  const profileDynamicFieldObject = useGetDynamicFieldObject({
    dynamic_field_name: {
      type: 'address',
      value: address?.address ?? '',
    },
    tableId: profileTableId ?? '',
  });

  const profile = useMemo(() => {
    return profileDynamicFieldObject;
  }, [profileDynamicFieldObject]);

  const { fields, ipfsUrl, image_blob_id } = useMemo(() => {
    const fields = profile?.data?.content?.dataType === "moveObject"
      ? (profile.data.content.fields as any)
      : undefined;

    const ipfsUrl = fields?.value?.fields?.ipfs_nft_url;

    const image_blob_id = fields?.value?.fields?.image_blob_id;

    return { fields, ipfsUrl, image_blob_id };
  }, [profile]);

  const handleProfileClick = () => {
    if (profile?.data?.content) {
      setShowProfileModal(true);
    } else {
      setIsProfileOpen(true);
    }
  };

  return (
    <Container>
      <Flex
        position="sticky"
        top="0"
        px="4"
        py="2"
        justify="between"
        className="border-b flex flex-wrap"
      >
        <Box className="flex flex-col items-center">
          <Heading className="flex items-center gap-3">WalrusX</Heading>
        </Box>

        <Box className="flex gap-5 items-center">
          {menu.map((item) => (
            <Box key={item.link} className="flex justify-center">
              <NavLink
                key={item.link}
                to={item.link}
                className={({ isActive, isPending }) =>
                  `cursor-pointer flex items-center gap-2 ${
                    isPending
                      ? "pending"
                      : isActive
                        ? "font-bold text-blue-600"
                        : ""
                  }`
                }
              >
                {item.title}
              </NavLink>
            </Box>
          ))}
        </Box>

        <Box className="connect-wallet-wrapper flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="outline-none">
                <Box className="hover:opacity-80 transition-opacity w-6 h-6">
                  {ipfsUrl ? (
                    <img
                      src={ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt="Profile NFT"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle size={24} className="text-gray-600" />
                  )}
                </Box>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white rounded-lg shadow-lg p-1 min-w-[160px] z-50"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item className="outline-none">
                  <button
                    onClick={handleProfileClick}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2 w-full"
                  >
                    {profile?.data?.content? "Show Profile" : "Mint Profile"}
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <ConnectButton />
        </Box>
      </Flex>

      <XProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <Dialog.Root open={showProfileModal} onOpenChange={setShowProfileModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 w-[90%] max-w-md shadow-2xl border border-gray-100">
            <Dialog.Close className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <FaTimes className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Dialog.Close>

            <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-800">
              Your Profile
            </Dialog.Title>

            {fields && (
              <Flex direction="column" gap="4">
                <Box className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaUser className="text-purple-500" />
                    <Text
                      weight="bold"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Nickname
                    </Text>
                  </div>
                  <Text className="text-gray-800 font-medium pl-6">
                    {fields?.value?.fields?.nickname}
                  </Text>
                </Box>

                <Box className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaEnvelope className="text-blue-500" />
                    <Text
                      weight="bold"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                      Email
                    </Text>
                  </div>
                  <Text className="text-gray-800 font-medium pl-6">
                    {fields?.value?.fields?.email}
                  </Text>
                </Box>

                <Box className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaBookOpen className="text-emerald-500" />
                    <Text
                      weight="bold"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"
                    >
                      Bio
                    </Text>
                  </div>
                  <Text className="text-gray-800 font-medium pl-6">
                    {fields?.value?.fields?.bio}
                  </Text>
                </Box>

                <Box className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaClock className="text-amber-500" />
                    <Text
                      weight="bold"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"
                    >
                      Created At
                    </Text>
                  </div>
                  <Text className="text-gray-800 font-medium pl-6">
                    {new Date(
                      Number(fields?.value?.fields?.created_at),
                    ).toLocaleString()}
                  </Text>
                </Box>

                <Box>
                  <Text weight="bold">NFT:</Text>
                  <img
                    src={ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    alt="NFT"
                    className="w-full rounded-lg mt-2"
                  />
                </Box>
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
};

export default Header;
