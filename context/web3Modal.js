import WalletConnectProvider from "@walletconnect/web3-provider";
import { sequence } from "0xsequence";
import UAuthSPA from "@uauth/js";
import * as UAuthWeb3Modal from "./UAuthWeb3";

const uauthOptions = {
  clientID: "dfa3c076-9ec7-4713-bad7-8850f2df88aa",
  redirectUri: "http://localhost:3000",
  scope: "openid wallet",
};
export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "95f65ab099894076814e8526f52c9149",
    },
  },

  sequence: {
    package: sequence, // required
    options: {
      appName: "Liquid721", // optional
      defaultNetwork: "polygon", // optional
    },
  },
  "custom-uauth": {
    display: UAuthWeb3Modal.display,
    connector: UAuthWeb3Modal.connector,
    package: UAuthSPA,
    options: uauthOptions,
  },
};
