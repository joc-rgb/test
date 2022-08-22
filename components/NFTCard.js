import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Flex,
  Circle,
  Box,
  Image,
  Badge,
  useColorModeValue,
  Text,
  Divider,
  Button,
  Link,
} from "@chakra-ui/react";

function NFTCard({ props, fn, btnText }) {
  console.log({ props, fn, btnText });
  return (
    <Flex p={3} alignItems="center" justifyContent="center">
      <Box
        bg={useColorModeValue("whitealpha.700", "gray.800")}
        maxW={250}
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
        fontFamily={"mono"}
        p={3}
      >
        <Image src={props.image} alt={props.collection} rounded="lg" />

        <Box p="3">
          <Flex
            mt="1"
            justifyContent="space-between"
            alignContent="center"
            mb={1}
          >
            <Box
              fontSize="sm"
              fontFamily={"mono"}
              fontWeight="bold"
              as="h4"
              lineHeight="tight"
              isTruncated
              alignContent="center"
            >
              {props.collection}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://mumbai.polygonscan.com/address/${props.nftAddress}`}
              >
                <ExternalLinkIcon />{" "}
              </Link>
            </Box>
            <Text
              fontSize="sm"
              fontWeight="bold"
              textColor={useColorModeValue("gray.600", "gray.200")}
            >
              #{props.tokenIds}
            </Text>
          </Flex>
          <Divider />
          <Flex justifyContent="space-between" alignContent="center" pt={2}>
            <Box fontSize="xs" color={useColorModeValue("gray.800", "white")}>
              <Text>Amount</Text>
              <Text>{props.amount} WETH</Text>
            </Box>
            <Box fontSize="xs" color={useColorModeValue("gray.800", "white")}>
              <Text>Duration</Text>
              <Text>
                {parseInt(props.duration.toString(), 16) / 86400} day(s)
              </Text>
            </Box>
            <Box fontSize="xs" color={useColorModeValue("gray.800", "white")}>
              <Text>APR</Text>
              <Text>{props.apr} %</Text>
            </Box>
          </Flex>
          <Button
            colorScheme={"purple"}
            onClick={(e) => fn(e, props)}
            size="sm"
            mt={4}
            mx="auto"
            maxW="100%"
            fontSize={"sm"}
            isTruncated
          >
            {btnText}
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}

export default NFTCard;
