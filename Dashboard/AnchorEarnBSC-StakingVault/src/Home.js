import React, {useState} from "react";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

import { RANGESTEP, MINVALUE, MAXVALUE } from './constants/constant';

import "./Home.css";
import ProgressiveImage from './components/ProgressiveImage/ProgressiveImage';
import ANCHOR_LOGO from './assets/images/favicon.png';
import ANCHOR_PLACEHOLDER from './assets/images/favicon.png';

export default function Home() {
	const [busdAmount, setBusdAmount] = useState(50);
	const connectWallet = () => {
		console.log(123);
	}
	const setMax = () => {
		console.log(123);
	}
	return (
		<>
			<div className="d-flex">
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
							<div className="title-second"><span style={{ color: "#f2f2f2" }}>EARN&nbsp;</span><span>BSC</span>
							</div>
						</div>
					</div>
					<div className="mt-4 d-flex flex-column align-items-center">
						<div className="mb-3">Website</div>
						<div className="mb-3">Community</div>
						<div>Documentation</div>
					</div>
				</div>
				<div className="d-flex right-block flex-column">
					<div className="header">
						<div className="content-left-block">
							<div className="title align-items-center d-flex flex-column">
								<div className="title-first">ANCHOR</div>
								<div className="title-second"><span style={{ color: "#020202" }}>EARN&nbsp;</span><span>BSC</span>
								</div>
							</div>
						</div>
						<div className="content-right-block d-flex justify-content-end">
							<button className='header-connect-wallet-btn' onClick={connectWallet}>Connect Wallet</button>
						</div>
					</div>
					<div className="d-flex align-items-center rsp-375 mt-4">
						<div className="content-left-block align-items-center d-flex flex-column">
							<div className="content d-flex flex-column">
								<div className="text-center content-title">Current APY: 0%</div>
								<div className="mt-4 mb-4">
									<div className="d-flex justify-content-around mt-4">
										<div>Stake</div>
										<div>Unstake</div>
									</div>
									<div className="d-flex mt-3">
										<div className="position-relative"><input placeholder="Amount" className="amount-input" /><span className="position-absolute max-button" onClick={setMax}>MAX</span></div>
										<button className="primary-button">Approve</button>
									</div>
									<div className="mt-4">Lock Time in Days:</div>
									<div className="input-range mt-3">
										
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
									<div className="d-flex justify-content-between mt-3">
										<div>Your Balance</div>
										<div>0.00 AEB</div>
									</div>
									<div className="d-flex justify-content-between mt-3">
										<div>Your Staked Balance</div>
										<div>0.00 AEB</div>
									</div>
									<div className="d-flex justify-content-between mt-3">
										<div>Your Until tokens Unlock</div>
										<div>0 Days</div>
									</div>
								</div>
								<button className="primary-button mt-4">Collect BUSD Rewards</button>
							</div>
						</div>
						<div className="content-right-block">
							Lock your tokens, Earn, and don't worry: your're not missing out on your BUSD rewards!<br />Simply manually claim them. Your share will be stored in the vault as long as you don't claim it.
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

