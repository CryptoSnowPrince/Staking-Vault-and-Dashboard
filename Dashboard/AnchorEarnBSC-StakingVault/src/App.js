import React, { useEffect, useState, useCallback, useReducer } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers/*, ethers*/ } from "ethers";
import Web3 from "web3";
import config from "./contracts/config";
import anchorEarnBSCABI from "./contracts/abi/AnchorEarnBSC.json";
import stakingVaultABI from "./contracts/abi/StakingVault.json";
import busdABI from "./contracts/abi/BUSD.json";
import Home from "./Home";
// import { parseEther, parseUnits } from "ethers/lib/utils";

const CLAIM_FEE = 0.0003;
const PENALTY_FEE = 0.003;

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

const getRemainDateTime = (second) => {
  let remain = parseInt(second);
  if (remain <= 0) return "0 Days";
  const day = parseInt(remain / 86400);
  remain = remain - day * 86400;
  // console.log(`r:${remain}`);
  if (day > 0) {
    if (remain > 1) {
      return (day + 1).toString() + " Days";
    }
    return day.toString() + " Days";
  }
  const hour = parseInt(remain / 3600);
  remain = remain - hour * 3600;
  if (hour > 0) {
    return (hour + 1).toString() + " Hours";
  }
  const mins = parseInt(remain / 60);
  remain = remain - mins * 60;
  return mins + ":" + remain;
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
const BusdContract = new web3.eth.Contract(
  busdABI,
  getAddress(config.BUSD)
)

const App = () => {
  const [showAccountAddress, setShowAccountAddress] = useState("");
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState();

  const [state, dispatch] = useReducer(reducer, initialState);

  const [clock, setClock] = useState(0);
  const [timeString, setTimeString] = useState("0 Days");

  const [balanceAEB, setBalanceAEB] = useState(0);
  const [stakedBalanceAEB, setStakedBalanceAEB] = useState(0);
  const [remainTimeToUnlock, setRemainTimeToUnlock] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);

  // const [contractState, setContractState] = useState("");

  const { provider, web3Provider } = state;

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
        account.slice(0, 5) + "..." + account.slice(-4, account.length);
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
        connect();
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

  const handleApprove = async (tokenAmount) => {
    // console.log(parseFloat(tokenAmount));
    if (parseFloat(tokenAmount) <= 0 || isNaN(parseFloat(tokenAmount))) return;
    try {
      const result = await AEBContract.methods
        .approve(
          config.StakingVault[config.chainID],
          web3.utils.toWei(parseFloat(tokenAmount).toString(), "Gwei")
        )
        .send({ from: account });
      init();
    } catch (error) {
      alert(
        `Transaction failed. Please check your account and retry. ${error.message}`
      );
      console.log(`${error}`);
    }
  };
  const handleStake = async (tokenAmount, stakingTime) => {
    // console.log(parseFloat(tokenAmount));
    if (parseFloat(tokenAmount) <= 0 || parseFloat(tokenAmount) === NaN) return;
    try {
      const result = await StakingContract.methods
        .stakeAEB(
          web3.utils.toWei(parseFloat(tokenAmount).toString(), "Gwei"),
          parseInt(stakingTime)
        )
        .send({ from: account });
      init();
    } catch (error) {
      alert(
        `Transaction failed. Please check your account and retry. ${error.message}`
      );
      console.log(`${error}`);
    }
  };
  const handleUnstake = async () => {
    init();
    if (stakedBalanceAEB <= 0) {
      alert(`There is not staked token.`);
      return;
    }
    const feeValue =
      stakedBalanceAEB *
      (remainTimeToUnlock > 0 ? CLAIM_FEE + PENALTY_FEE : CLAIM_FEE);
    try {
      const result = await StakingContract.methods.unstakeAEB().send({
        from: account,
        value: web3.utils.toWei(Number(feeValue).toString(), "ether"),
      });
      init();
    } catch (error) {
      alert(
        `Transaction failed. Please check your account and retry. ${error.message}`
      );
      console.log(`${error}`);
    }
  };

  // const handleClaimStakingReward = async () => {
  //   // console.log(handleClaimStakingReward);
  // };

  const handleBUSDReward = async () => {
    init();
    if (stakedBalanceAEB <= 0) {
      alert(`You can't get BUSD Reward because there is not staked token.`);
      return;
    }
    const busdamount = await BusdContract.methods.balanceOf(getAddress(config.StakingVault)).call();
    if(web3.utils.fromWei(busdamount, "ether") < 1) {
      console.log("busdamount: ", busdamount);
      alert(`You can't get enough BUSD Reward, so you can lost your transaction fee...`);
    }
    try {
      const result = await StakingContract.methods.claimBusdReward().send({
        from: account,
      });
      init();
    } catch (error) {
      alert(
        `Transaction failed. Please check your account and retry. ${error.message}`
      );
      console.log(`${error}`);
    }
  };

  const init = async () => {
    // console.log(`init`);
    setClock(0);
    try {
      const balance = await AEBContract.methods.balanceOf(account).call();
      const allowanceAmount = await AEBContract.methods
        .allowance(account, config.StakingVault[config.chainID])
        .call();
      const stakerInfo = await StakingContract.methods
        .userInfo_(account)
        .call();
      setBalanceAEB(web3.utils.fromWei(balance, "Gwei"));
      setStakedBalanceAEB(web3.utils.fromWei(stakerInfo.amount, "Gwei"));
      const pendingBlock = await web3.eth.getBlock("pending");
      console.log("pendingBlock timestamp: ", pendingBlock.timestamp);
      const remainTime =
        stakerInfo.amount > 0 ? stakerInfo.endStakeTime - pendingBlock.timestamp : 0;
      setRemainTimeToUnlock(remainTime);
      setAllowanceAmount(web3.utils.fromWei(allowanceAmount, "Gwei"));
    } catch (error) {
      console.log(`${error}`);
    }
  };

  let timer;
  useEffect(() => {
    init();
    clearInterval(timer);
    timer = setInterval(() => {
      setClock((prevState) => prevState + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    init();
  }, [state]);

  useEffect(() => {
    setTimeString(getRemainDateTime(remainTimeToUnlock - clock));
  }, [clock]);

  return (
    <>
      <Home
        showAccountAddress={showAccountAddress}
        connect={connect}
        disconnect={disconnect}
        handleApprove={handleApprove}
        handleStake={handleStake}
        handleUnstake={handleUnstake}
        handleBUSDReward={handleBUSDReward}
        web3Provider={web3Provider}
        balanceAEB={balanceAEB}
        stakedBalanceAEB={stakedBalanceAEB}
        stakingAPR={getStakingAPR()}
        allowanceAmount={allowanceAmount}
        timeString={timeString}
      />
    </>
  );
};

export default App;
