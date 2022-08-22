import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Web3Provider } from "../context/Web3Context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <ChakraProvider>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </ChakraProvider>
    </Web3Provider>
  );
}

export default MyApp;
