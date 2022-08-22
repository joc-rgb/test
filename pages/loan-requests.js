import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import Borrow from "../components/Borrow";
import NFTCard from "../components/NFTCard";
import { Web3Context } from "../context/Web3Context";

export default function LoanRequests() {
  const btnText = "Fulfill Loan";
  const [filter, setFilter] = useState(false);

  const { account, loanNFTs, fetchLoanNFTs, fulfillLoan } =
    useContext(Web3Context);

  const lend = (e, props) => {
    e.preventDefault();
    console.log(props);
    fulfillLoan(props.loanAddr, ethers.utils.parseEther(props.amount));
  };

  useEffect(() => {
    if (account) {
      fetchLoanNFTs();
    }
  }, [account]);

  return (
    <Box minH={"100vh"} p={6} pt={20} fontFamily={"mono"}>
      <Flex justifyContent={"center"} alignItems={"center"}>
        <Heading fontFamily={"mono"} fontSize={"2xl"} colorScheme={"gray"}>
          Loan Requests
        </Heading>

        <Borrow icon={<AddIcon />} color={"purple"} text={"Add"} />
        <Spacer />
      </Flex>

      {filter && (
        <Box
          p={6}
          m={1}
          bg={useColorModeValue("whitealpha.700", "gray.700")}
          shadow="md"
          rounded="md"
        >
          <Text fontSize={"md"}>APR(%)</Text>
        </Box>
      )}
      <Flex flexWrap={"wrap"} w={"full"}>
        {loanNFTs.length !== 0 ? (
          loanNFTs
            .filter((loanNFT) => loanNFT.loanState == "0x00")
            .map((loan, index) => (
              <NFTCard key={index} props={loan} btnText={btnText} fn={lend} />
            ))
        ) : (
          <Text>
            No loan request currently. If you believe there should be a loan,
            please sign in again.
          </Text>
        )}
      </Flex>
    </Box>
  );
}

/**
 * 

function FilterSlider() {
  const [sliderValue, setSliderValue] = useState(50);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  return (
    <Box pt={6} pb={2}>
      <Slider
        colorScheme="purple"
        aria-label="slider-ex-6"
        onChange={(val) => setSliderValue(val)}
      >
        <SliderMark value={25} {...labelStyles}>
          25%
        </SliderMark>
        <SliderMark value={50} {...labelStyles}>
          50%
        </SliderMark>
        <SliderMark value={75} {...labelStyles}>
          75%
        </SliderMark>
        <SliderMark
          value={sliderValue}
          textAlign="center"
          bg="purple.500"
          color="white"
          mt="-10"
          ml="-5"
          w="12"
        >
          {sliderValue}%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
}
 * 
 */
