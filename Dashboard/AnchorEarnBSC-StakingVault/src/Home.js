import React, { useState } from "react";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { RANGESTEP, MINVALUE, MAXVALUE } from "./constants/constant";
import "react-notifications/lib/notifications.css";

import "./Home.css";
import ProgressiveImage from "./components/ProgressiveImage/ProgressiveImage";
import AppSpinner from "./components/loading/AppSpinner";
import ANCHOR_LOGO from "./assets/images/favicon.png";
import ANCHOR_PLACEHOLDER from "./assets/images/favicon.png";

export default function Home(props) {
  const [loading, setLoading] = useState(false);
  const [busdAmount, setBusdAmount] = useState(50);
  const [tokenBalance, setTokenBalance] = useState();
  const [stakeFlag, setStakeFlag] = useState(0);
  const setTokenBalanceMax = () => {
    props.web3Provider
      ? console.log(234)
      : NotificationManager.info("Please connect wallet!");
  };
  return (
    <>
      <div className="d-flex height-100">
        <div className="d-flex flex-column align-items-center left-block">
          <div className="d-flex align-items-center gap-3 mt-4 mb-4 rsp-375">
            <ProgressiveImage
              src={ANCHOR_LOGO}
              alt=""
              placeholder={ANCHOR_PLACEHOLDER}
              errorImage=""
              className="logo mt-4 mb-4"
            />
            <div className="left-title align-items-center d-flex flex-column">
              <div className="title-first">ANCHOR</div>
              <div className="title-second">
                <span>EARN&nbsp;</span>
                <span>BSC</span>
              </div>
            </div>
          </div>
          <div className="mt-4 d-flex flex-column align-items-center">
            <div className="mb-3">
              <a href="/">Website</a>
            </div>
            <div className="mb-3">
              <a href="/">Community</a>
            </div>
            <div>
              <a href="/">Documentation</a>
            </div>
          </div>
        </div>
        <div className="d-flex right-block flex-column">
          <div className="header">
            <div className="content-left-block">
              <div className="title align-items-center d-flex flex-column">
                <div className="title-first  position-relative">
                  <span style={{ zIndex: "10" }}>ANCHOR</span>
                </div>
                <div className="title-second">
                  <span style={{ color: "#020202" }}>EARN</span>&nbsp;
                  <span>BSC</span>
                </div>
              </div>
            </div>
            <div className="content-right-block d-flex justify-content-end">
              {props.web3Provider ? (
                <button
                  className="header-connect-wallet-btn"
                  onClick={props.disconnect}
                >
                  {props.account}
                </button>
              ) : (
                <button
                  className="header-connect-wallet-btn"
                  onClick={props.connect}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
          <div
            className="d-flex align-items-center rsp-375"
            style={{ flex: "1" }}
          >
            <div className="content-left-block align-items-center d-flex flex-column">
              <div className="content d-flex flex-column">
                <div className="text-center content-title">Current APR: {props.stakingAPR}%</div>
                <div className="mt-4 mb-4">
                  <div className="d-flex justify-content-around mt-4">
                    <button
                      className={`${stakeFlag ? "active" : ""} stake-statue`}
                      onClick={() => {
                        setStakeFlag(!stakeFlag);
                      }}
                    >
                      Stake
                    </button>
                    <button
                      className={`${!stakeFlag ? "active" : ""} stake-statue`}
                      onClick={() => {
                        setStakeFlag(!stakeFlag);
                      }}
                    >
                      Unstake
                    </button>
                  </div>
                  <div className="d-flex mt-3">
                    <div className="position-relative">
                      <input
                        placeholder="Amount"
                        className="amount-input"
                        value={tokenBalance}
                        onChange={(e) => {
                          setTokenBalance(e.target.value);
                        }}
                      />
                      <span
                        className="position-absolute max-button"
                        onClick={setTokenBalanceMax}
                      >
                        MAX
                      </span>
                    </div>
                    <button
                      className="primary-button"
                      onClick={props.handleApprove}
                    >
                      Approve
                    </button>
                  </div>
                  <br />
                  <div className="input-rangemb-4 position-relative">
                    <div
                      className="position-absolute"
                      style={{ top: "-1.7rem" }}
                    >
                      <sub>Lock Time in Days: {busdAmount}</sub>
                    </div>
                    <InputRange
                      step={RANGESTEP}
                      maxValue={MAXVALUE}
                      minValue={MINVALUE}
                      value={busdAmount}
                      onChange={(value) => {
                        setBusdAmount(value);
                      }}
                    />
                  </div>
                  <br />
                  <div className="d-flex justify-content-between">
                    <div>
                      <sub>Your Balance</sub>
                    </div>
                    <div>
                      <sub>
                        {props.web3Provider
                          ? Number(props.balanceAEB).toFixed(2)
                          : "0.00"}{" "}
                        AEB
                      </sub>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <div>
                      <sub>Your Staked Balance</sub>
                    </div>
                    <div>
                      <sub>
                        {props.web3Provider
                          ? Number(props.stakedBalanceAEB).toFixed(2)
                          : "0.00"}{" "}
                        AEB
                      </sub>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <div>
                      <sub>Your Until tokens Unlock</sub>
                    </div>
                    <div>
                      <sub>0 Days</sub>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="primary-button mt-4 w-75"
                    onClick={props.handleCollectReward}
                  >
                    Collect BUSD Rewards
                  </button>
                </div>
              </div>
            </div>
            <div className="content-right-block text-center">
              Lock your tokens, Earn, and don't worry: your're not missing out
              on your BUSD rewards!
              <br />
              Simply manually claim them. Your share will be stored in the vault
              as long as you don't claim it.
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer />
      {loading && <AppSpinner absolute />}
    </>
  );
}
