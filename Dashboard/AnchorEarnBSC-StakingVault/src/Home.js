import React, { useState } from "react";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";
import {
  NotificationContainer,
  //   NotificationManager,
} from "react-notifications";
import { RANGESTEP, MINVALUE, MAXVALUE } from "./constants/constant";
import "react-notifications/lib/notifications.css";

import "./Home.css";
import ProgressiveImage from "./components/ProgressiveImage/ProgressiveImage";
import AppSpinner from "./components/loading/AppSpinner";
import config from "./contracts/config";
import ANCHOR_LOGO from "./assets/images/favicon.png";
import ANCHOR_PLACEHOLDER from "./assets/images/favicon.png";

export default function Home(props) {
  const [loading, setLoading] = useState(false);
  const [stakingTime, setStakingTime] = useState(MAXVALUE);
  const [tokenAmount, setTokenAmount] = useState();
  const [stakeFlag, setStakeFlag] = useState(true);

  const setTokenAmountMax = (e) => {
    if (stakeFlag === true) {
      props.web3Provider
        ? setTokenAmount(
            props.balanceAEB > config.MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS
              ? config.MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS
              : props.balanceAEB
          )
        : setTokenAmount(0);
      // : NotificationManager.info("Please connect wallet!");
    }
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
              <a href={config.Website}>Website</a>
            </div>
            <div className="mb-3">
              <a href={config.Community}>Community</a>
            </div>
            <div>
              <a href={config.Documentation}>Documentation</a>
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
                  {props.showAccountAddress}
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
                <div className="text-center content-title">
                  Current APR: {props.stakingAPR}%
                </div>
                <div className="mt-4 mb-4">
                  <div className="d-flex justify-content-around mt-4">
                    <button
                      className={`${!stakeFlag ? "active" : ""} stake-statue`}
                      onClick={() => {
                        setStakeFlag(true);
                      }}
                    >
                      Stake
                    </button>
                    <button
                      className={`${stakeFlag ? "active" : ""} stake-statue`}
                      onClick={() => {
                        setTokenAmount(0);
                        setStakeFlag(false);
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
                        disabled={!stakeFlag}
                        value={tokenAmount}
                        onChange={(e) => {
                          if (parseFloat(e.target.value) > props.balanceAEB) {
                            alert(
                              `Balance overflow! Your balance is ${props.balanceAEB}.`
                            );
                            setTokenAmount(props.balanceAEB);
                          } else if (
                            parseFloat(e.target.value) >
                            config.MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS
                          ) {
                            alert(
                              `Max balance to stake per holder overflow! Max balance is ${config.MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS}.`
                            );
                            setTokenAmount(
                              config.MAX_STAKE_AMOUNT_PER_USER_DIV_DECIMALS
                            );
                          } else {
                            setTokenAmount(e.target.value);
                          }
                        }}
                      />
                      <span
                        className="position-absolute max-button"
                        onClick={(e) => setTokenAmountMax(e)}
                      >
                        MAX
                      </span>
                    </div>
                    <button
                      className="primary-button fixed-width-button-150"
                      onClick={
                        stakeFlag === true
                          ? props.allowanceAmount < parseFloat(tokenAmount)
                            ? () => props.handleApprove(tokenAmount)
                            : () => props.handleStake(tokenAmount, stakingTime)
                          : () => props.handleUnstake(tokenAmount)
                      }
                    >
                      {stakeFlag === true
                        ? props.allowanceAmount < parseFloat(tokenAmount)
                          ? "Approve"
                          : "Stake"
                        : "Unstake"}
                    </button>
                  </div>
                  <br />
                  <div
                    className={
                      !stakeFlag
                        ? "input-rangemb-4 position-relative unstake-unvisible"
                        : "input-rangemb-4 position-relative"
                    }
                  >
                    <div
                      className="position-absolute"
                      style={{ top: "-1.7rem" }}
                    >
                      <sub>Lock Time in Days: {stakingTime}</sub>
                    </div>
                    <InputRange
                      step={RANGESTEP}
                      maxValue={MAXVALUE}
                      minValue={MINVALUE}
                      value={stakingTime}
                      onChange={(value) => {
                        setStakingTime(value);
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
                      <sub>{props.web3Provider ? props.timeString : "0 Days"}</sub>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="primary-button mt-4 w-75"
                    onClick={props.handleBUSDReward}
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
