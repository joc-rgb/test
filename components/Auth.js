import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  VStack,
  Button,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import Avatar from "boring-avatars";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import truncateMiddle from "../utils/truncateMiddle";

export default function Auth() {
  const { account, connectWallet, disconnect } = useContext(Web3Context);

  if (account)
    return (
      <Flex alignItems={"center"} fontFamily={"mono"}>
        <Menu>
          <MenuButton transition="all 0.3s" _focus={{ boxShadow: "none" }}>
            <HStack>
              <Avatar
                size={40}
                name={account}
                variant="beam"
                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
              />
              ;
              <VStack
                display={{ base: "none", md: "flex" }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="sm">{truncateMiddle(account)}</Text>
              </VStack>
              <Box display={{ base: "none", md: "flex" }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList
            bg={useColorModeValue("white", "gray.900")}
            borderColor={"gray.500"}
          >
            <MenuItem>
              <Link href={"/dashboard"}>Dashboard</Link>
            </MenuItem>
            <MenuItem>
              <Link href={"/create-loan"}>Create Loan</Link>
            </MenuItem>

            <MenuDivider />
            <MenuItem onClick={disconnect}>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    );
  else return <Button onClick={connectWallet}>Connect</Button>;
}
