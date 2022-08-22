import {
  Flex,
  Box,
  Image,
  useColorModeValue,
  Text,
  Link,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState } from "react";

function DisplayCard({
  collection,
  tokenId,
  addr,
  image,
  collateral,
  setCollateral,
}) {
  return (
    <Flex
      p={3}
      alignItems="center"
      justifyContent="center"
      cursor={"pointer"}
      onClick={() => {
        setCollateral({ addr, tokenId });
      }}
    >
      <Box
        bg={useColorModeValue("whitealpha.700", "gray.800")}
        maxW={180}
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
        fontFamily={"mono"}
        p={2}
        borderColor={
          addr == collateral.addr && tokenId == collateral.tokenId
            ? "blue.300"
            : ""
        }
      >
        <Image src={image} alt={`${collection}`} rounded="lg" />

        <Box p="3">
          <Flex
            mt="1"
            justifyContent="space-between"
            alignContent="center"
            mb={1}
          >
            <Box
              fontSize="xs"
              fontFamily={"mono"}
              fontWeight="bold"
              as="h4"
              lineHeight="tight"
              isTruncated
              noOfLines={1}
              w="80%"
            >
              {collection}
            </Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textColor={useColorModeValue("gray.600", "gray.200")}
            >
              #{ethers.utils.hexValue(tokenId).slice(2)}
            </Text>
          </Flex>
          <Text
            fontSize="xs"
            textColor={useColorModeValue("blue.600", "blue.200")}
          >
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`https://mumbai.polygonscan.com/address/${addr}`}
            >
              View contract
            </Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}

export default DisplayCard;
