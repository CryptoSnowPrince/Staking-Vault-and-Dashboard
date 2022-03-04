import React, { useEffect, useState, useCallback, useReducer } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers, ethers } from "ethers";
import Web3 from "web3";

import Home from "./Home";
import abi from "./constants/abi.json";

const INFURA_ID = "88b3ca144c6648df843909df0371ee08";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID, // required
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
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
const busdAddress = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const web3 = new Web3(window.ethereum)
const contract = new web3.eth.Contract(abi, busdAddress);

const  App = () => {
  const [account, setAccount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [signer, setSigner] = useState();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { provider, web3Provider } = state;
  const connect = useCallback(async function () {
    const provider = await web3Modal.connect();
    if (window.ethereum) {
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x38',
                  rpcUrl: 'https://bsc-dataseed1.defibit.io/',
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    } else {
      alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
    } 

    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const user_address = await signer.getAddress();
    const network = await web3Provider.getNetwork();
    const address = user_address.slice(0, 5) + '...'+ user_address.slice(-4, user_address.length)
    setSigner(web3Provider.getSigner());
    setAccount(address);
    setUserAddress(user_address);
    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
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
        console.log('accountsChanged', accounts)
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        })
      }

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId) => {
        window.location.reload()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [provider]);

  const handleApprove = () => {
    console.log(123) ;
  }
  const handleCollectReward = () => {
    console.log(123) ;
  }
  return (
    <>
      <Home
        account={account}
        connect={connect}
        handleApprove={handleApprove}
        handleCollectReward={handleCollectReward}
        web3Provider={web3Provider} 
      />
    </>
  );
}

export default App;
