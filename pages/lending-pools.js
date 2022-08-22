import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import Borrow from "../components/Borrow";
import Supply from "../components/Supply";

export default function LendingPools() {
  return (
    <Box minH={"100vh"} p={6} pt={20} fontFamily={"mono"}>
      <Flex>
        <Heading fontFamily={"mono"} fontSize={"2xl"} colorScheme={"gray"}>
          Lending Pools
        </Heading>
        <Spacer />
      </Flex>

      <Flex flexWrap={"wrap"} w={"full"} mt={10}>
        <Text>Frontend In Progress!</Text>
      </Flex>
    </Box>
  );
}
