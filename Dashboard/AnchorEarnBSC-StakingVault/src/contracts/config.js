import dotenv from "dotenv";

dotenv.config();

const config = {
  AnchorEarnBSC: {
    56: "0x0EA7C4c6A230e091e930b0E6fD9D5c18a6699Cbc",
    97: "0x80de92df50F270e49bb4E269502D00cAB753A55a",
  },
  StakingVault: {
    56: "0x07CD66cdc4571aAb645D4819E3A91F61D847792E",
    97: "0xd6861aB260a8c2f060d3E541Df7696dDBC9AB682",
  },
  BUSD: {
    56: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    97: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
  },
  BlockExplorerURL: {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
  },
  RpcURL: {
    56: "https://bsc-dataseed1.defibit.io/",
    97: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/bsc/testnet",
  },
  chainHexID: {
    56: "0x38",
    97: "0x61",
  },
  MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS: 100000000,
  INFURA_ID: process.env.REACT_APP_INFURA_ID,
  chainID: 56,
  Website: "https://www.anchorearnbsc.com/",
  Community: "https://t.me/AnchorEarnBSC",
  Documentation: "https://read-whitepaper.gitbook.io/anchor-earn-bsc/",
};

export default config;
