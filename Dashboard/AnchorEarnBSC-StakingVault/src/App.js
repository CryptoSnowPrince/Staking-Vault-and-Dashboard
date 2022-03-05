import React, { useEffect, useState, useCallback, useReducer } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers, ethers } from "ethers";
import Web3 from "web3";
import config from "./contracts/config";
import anchorEarnBSCABI from "./contracts/abi/AnchorEarnBSC.json";
import stakingVaultABI from "./contracts/abi/StakingVault.json";
import Home from "./Home";
import { parseEther, parseUnits } from "ethers/lib/utils";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: config.INFURA_ID, // required
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions, // required
    theme: "dark",
  });
}

const initialState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

const getAddress = (address) => {
  const chainID = config.chainID;
  return address[chainID] ? address[chainID] : address[0];
};

const getStakingAPR = (address) => {
  return 365;
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

const web3 = new Web3(window.ethereum);
const AEBContract = new web3.eth.Contract(
  anchorEarnBSCABI,
  getAddress(config.AnchorEarnBSC)
);
const StakingContract = new web3.eth.Contract(
  stakingVaultABI,
  getAddress(config.StakingVault)
);

const App = () => {
  const [showAccountAddress, setShowAccountAddress] = useState("");
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState();

  const [state, dispatch] = useReducer(reducer, initialState);

  const [timeup, setTimeup] = useState(false);

  const [balanceAEB, setBalanceAEB] = useState(0);
  const [stakedBalanceAEB, setStakedBalanceAEB] = useState(0);
  const [contractState, setContractState] = useState("");

  const { provider, web3Provider } = state;

  setTimeout(() => {
    const set = !timeup;
    setTimeup(set);
  }, 5000);

  const connect = useCallback(async function () {
    try {
      const provider = await web3Modal.connect();
      if (window.ethereum) {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.chainHexID[config.chainID] }], // chainId must be in hexadecimal numbers
        });
      } else {
        alert(
          "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
        );
      }

      const web3Provider = new providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const account = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      const show_address =
        account.slice(0, 5) +
        "..." +
        account.slice(-4, account.length);
      setSigner(web3Provider.getSigner());
      setShowAccountAddress(show_address);
      setAccount(account);
      dispatch({
        type: "SET_WEB3_PROVIDER",
        provider,
        web3Provider,
        show_address,
        chainId: network.chainId,
      });
    } catch (error) {
      if (error.code === 4902) {
        console.log("pass here");
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: config.chainHexID[config.chainID],
                rpcUrl: config.RpcURL[config.chainID],
              },
            ],
          });
        } catch (addError) {
          console.log(addError);
        }
      } else if (error.code === 4001) {
        console.log(error);
      }
      console.log(`${error}`);
    }
  }, []);
  const disconnect = useCallback(async function () {
    await web3Modal.clearCachedProvider();
    setSigner(null);
    setShowAccountAddress(null);
    setAccount(null);
    dispatch({
      type: "RESET_WEB3_PROVIDER",
    });
  }, []);
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);
  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        dispatch({
          type: "SET_ADDRESS",
          address: accounts[0],
        });
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId) => {
        window.location.reload();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [provider]);

  useEffect(async () => {
    try {
      const balance = await AEBContract.methods.balanceOf(account).call();
      const stakerInfo = await StakingContract.methods
        .userInfo_(account)
        .call();
      setBalanceAEB(web3.utils.fromWei(balance, "Gwei"));
      setStakedBalanceAEB(web3.utils.fromWei(stakerInfo.amount, "Gwei"));
    } catch (error) {
      console.log(`${error}`);
    }
  }, [contractState, timeup]);

  const handleApprove = async () => {
    try {
      const balance = await AEBContract.methods.balanceOf(account).call();
      const stakerInfo = await StakingContract.methods
        .userInfo_(account)
        .call();
      setBalanceAEB(web3.utils.fromWei(balance, "Gwei"));
      setStakedBalanceAEB(web3.utils.fromWei(stakerInfo.amount, "Gwei"));
    } catch (error) {
      console.log(`${error}`);
    }
  };
  const handleCollectReward = () => {
    console.log(123);
  };
  const init = async () => {
    try {
      const balance = await AEBContract.methods.balanceOf(account).call();
      const stakerInfo = await StakingContract.methods
        .userInfo_(account)
        .call();
      setBalanceAEB(web3.utils.fromWei(balance, "Gwei"));
      setStakedBalanceAEB(web3.utils.fromWei(stakerInfo.amount, "Gwei"));
    } catch (error) {
      console.log(`${error}`);
    }
  };
  init();
  return (
    <>
      <Home
        showAccountAddress={showAccountAddress}
        connect={connect}
        disconnect={disconnect}
        handleApprove={handleApprove}
        handleCollectReward={handleCollectReward}
        web3Provider={web3Provider}
        balanceAEB={balanceAEB}
        stakedBalanceAEB={stakedBalanceAEB}
        stakingAPR={getStakingAPR()}
      />
    </>
  );
};

export default App;
