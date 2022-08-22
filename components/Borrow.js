import React, { useContext, useState, useMemo } from "react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Flex,
  Text,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { Web3Context } from "../context/Web3Context";
import DisplayCard from "./DisplayCard";
import aprCalculator from "../utils/aprCalculator";

const Borrow = ({ color, icon, text }) => {
  const { fetchUserNFTs, requestLoan, whitelistNFT, account, userNFTs } =
    useContext(Web3Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  //Form Input
  const [collateral, setCollateral] = useState({});
  const [amount, setAmount] = useState(0);
  const [rate, setRate] = useState(0);
  const [duration, setDuration] = useState(0);
  useMemo(() => {
    if (account) {
      fetchUserNFTs(account);
    }
  }, [account]);

  const createLoan = async (e) => {
    e.preventDefault();
    toast({
      title: "Creating Loan...",
      description: "Transaction in progress...",
      position: "bottom-right",
      status: "loading",
      duration: 9000,
      isClosable: true,
      variant: "subtle",
    });
    console.log(collateral);
    requestLoan(collateral, amount, rate, duration);
  };

  return (
    <>
      <Button
        onClick={onOpen}
        mx={8}
        colorScheme={color}
        leftIcon={icon}
        variant="outline"
      >
        {text}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request a Loan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir="column" w="full" p={4}>
              <Text fontSize={"md"} mb={2}>
                Choose NFT for collateral
              </Text>
              {userNFTs?.length != 0 ? (
                <Flex flexWrap={"wrap"} w={"full"}>
                  {userNFTs?.map((nft, index) => (
                    <DisplayCard
                      key={index}
                      collection={nft.title}
                      addr={nft.contract.address}
                      tokenId={nft.id.tokenId}
                      image={nft.metadata.image}
                      setCollateral={setCollateral}
                      collateral={collateral}
                    />
                  ))}
                </Flex>
              ) : (
                <Text my={10}>
                  Sorry, you don&apos;t have any whitelisted NFTs!
                </Text>
              )}
              <FormControl>
                <FormLabel fontSize={"md"} mb={2}>
                  Loan Amount(WETH)
                </FormLabel>
                <NumberInput
                  min={0}
                  isRequired
                  defaultValue={0}
                  onChange={(val) => setAmount(val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormLabel fontSize={"md"} mt={10} mb={8}>
                  Duration(days)
                </FormLabel>
                <Slider
                  aria-label="duration"
                  colorScheme="purple"
                  defaultValue={duration}
                  onChange={(val) => setDuration(val)}
                >
                  <SliderMark
                    value={duration}
                    fontSize="sm"
                    textAlign="center"
                    bg="purple.500"
                    color="white"
                    mt="-10"
                    ml="-5"
                    fontWeight={"bold"}
                    w="20"
                    rounded="xl"
                  >
                    {duration} days
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <FormLabel fontSize={"md"} mt={10} mb={8}>
                  APR Percentage(%)
                </FormLabel>
                <Slider
                  max={300}
                  aria-label="slider-ex-2"
                  colorScheme="purple"
                  defaultValue={rate}
                  onChange={(val) => setRate(val)}
                >
                  <SliderMark
                    value={rate}
                    textAlign="center"
                    bg="purple.500"
                    fontSize="sm"
                    fontWeight={"bold"}
                    color="white"
                    mt="-10"
                    ml="-5"
                    rounded="xl"
                    w="12"
                  >
                    {rate}%
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>{" "}
              <Flex alignItems={"center"} justifyContent="center" gap={3}>
                <Text fontSize="md" fontWeight={"extrabold"}>
                  Your Repayment Amount:{" "}
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight={"extrabold"}
                  textColor={useColorModeValue("purple.600", "purple.200")}
                >
                  {aprCalculator(amount, duration, rate)} WETH
                </Text>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Box display={"flex"}>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                colorScheme="purple"
                maxW={300}
                type={"submit"}
                onClick={(e) => createLoan(e)}
              >
                Create Loan
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Borrow;
