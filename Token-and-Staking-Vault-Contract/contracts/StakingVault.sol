//SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Staking Vault Contract
 * @author Chai Hang
 * @notice This contract can be used by only owner
 */
contract StakingVault is Ownable {

    //--------------------------------------
    // Data structure
    //--------------------------------------

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many AEB tokens the user has provided.
        uint256 stakingRewarded;
        uint256 lastClaimBlockNumber;
        uint256 startStakeTime;         // stake starttime
        uint256 endStakeTime;           // stake endtime
        uint256 busdRewarded;
    }

    //--------------------------------------
    // Constant
    //--------------------------------------

    // Testnet Address
    IERC20 constant BUSD                            = IERC20(0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7);
    address payable constant TREASURY_WALLET        = payable(0x821965C1fD8B60D4B33E23C5832E2A7662faAADC);
    address constant REWARD_TOKEN_WALLET            = 0x36285fDa2bE8a96fEb1d763CA77531D696Ae3B0b;

    // Mainnet Address
    // address constant BUSD                           = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);
    // address payable constant TREASURY_WALLET        = payable();
    // address constant REWARD_TOKEN_WALLET            = ;

    uint256 constant CLAIM_FEE                      = 3 * 10**14;                                   // 0.0003 BNB
    uint256 constant PENALTY_FEE                    = 3 * 10**15;                                   // 0.003 BNB PER AEB
    uint256 constant MAX_STAKE_AMOUNT_PER_USER      = 10000;
    uint256 constant STAKING_TIME_UNIT              = 1 days;

    /**
     * staking rewards = 
     *  StakedAmount * (end.block.number - start.block.number)
     *  / RewardRatePerBlockPerToken
     */
    uint256 constant RewardRatePerBlockPerToken     = 2880000;

    
    //--------------------------------------
    // State variables
    //--------------------------------------

    IERC20 public token_;
    uint8 public minStakingTime_;
    uint8 public maxStakingTime_;
    mapping(address => UserInfo) userInfo;
    uint256 public totalStakeAmount;
    uint256 public deployedTime;

    //-------------------------------------------------------------------------
    // EVENTS
    //-------------------------------------------------------------------------

    event LogAEB(address indexed AEB);
    event LogStakeAEB(uint256 amount);
    event LogReceive(address indexed spender, uint256 amount);
    event LogFallback(address indexed spender, uint256 amount);
    event LogClaimStakingReward(uint256 amount);
    event LogUnstakeAEB(uint256 amount, uint256 stakingReward);
    event LogWithdraw(address indexed recipient, uint256 amount);

    //-------------------------------------------------------------------------
    // CONSTRUCTOR
    //-------------------------------------------------------------------------

    /**
     * @notice contract constructor
     * @dev initialize the state variables of the contract
     */
    constructor(address _token) {
        require(_token != address(0), "Zero Address");
        token_ = IERC20(_token);
        minStakingTime_ = 10;
        maxStakingTime_ = 100;
        totalStakeAmount = 0;
        deployedTime = block.timestamp;
    }

    //-------------------------------------------------------------------------
    // FUNCTIONS
    //-------------------------------------------------------------------------

    function setAEB(address _token) external onlyOwner {
        require(_token != address(0), "Zero Address");
        token_ = IERC20(_token);
        emit LogAEB(_token);
    }

    function stakeAEB(uint256 _amount, uint8 _stakingTime) external {
        require(_stakingTime >= minStakingTime_, "Staking Time must be at least 10 days");
        require(_stakingTime <= maxStakingTime_, "Staking Time must be less than 100 days");
        require(_amount <= MAX_STAKE_AMOUNT_PER_USER, "Max stake amount per user overflow");
        require(_amount <= token_.balanceOf(msg.sender), "Not enough AEB token to stake");
        require(userInfo[msg.sender].amount == 0, "Already token is staked");

        token_.transferFrom(msg.sender, address(this), _amount);

        totalStakeAmount += _amount;
        userInfo[msg.sender].amount = _amount;
        userInfo[msg.sender].startStakeTime = block.timestamp;
        userInfo[msg.sender].endStakeTime = block.timestamp + _stakingTime * STAKING_TIME_UNIT;
        userInfo[msg.sender].lastClaimBlockNumber = block.number;

        emit LogStakeAEB(_amount);
    }

    function unstakeAEB() external payable {
        require(userInfo[msg.sender].amount > 0, "Have not staked token");
        if(block.timestamp < userInfo[msg.sender].endStakeTime)
        {
            require(msg.value >= ((CLAIM_FEE + PENALTY_FEE) * userInfo[msg.sender].amount), 
                "Fee for claim and Penalty is not enough");
        } else {
            require(msg.value >= (CLAIM_FEE * userInfo[msg.sender].amount), 
                "Claim Fee is not enough");
        }

        uint256 amount = userInfo[msg.sender].amount;
        userInfo[msg.sender].amount = 0;
        uint256 stakingReward = amount * 
            (block.number - userInfo[msg.sender].lastClaimBlockNumber) / 
            RewardRatePerBlockPerToken;
        userInfo[msg.sender].stakingRewarded += stakingReward;
        userInfo[msg.sender].lastClaimBlockNumber = block.number;
        require(token_.balanceOf(REWARD_TOKEN_WALLET) >= stakingReward, 
            "Reward token is not enough.");
        token_.transferFrom(REWARD_TOKEN_WALLET, msg.sender, stakingReward);
        token_.transfer(msg.sender, amount);
        (bool sent, ) = TREASURY_WALLET.call{value: msg.value}("");
        require(sent == true, "Failed to send BNB");
        totalStakeAmount -= amount;

        emit LogUnstakeAEB(amount, stakingReward);
    }

    function claimStakingReward() external payable {
        require(userInfo[msg.sender].amount > 0, "Have not staked token");
        require(msg.value >= (CLAIM_FEE * userInfo[msg.sender].amount), 
            "Claim Fee is not enough");
        uint256 stakingReward = userInfo[msg.sender].amount * 
            (block.number - userInfo[msg.sender].lastClaimBlockNumber) / 
            RewardRatePerBlockPerToken;

        userInfo[msg.sender].stakingRewarded += stakingReward;
        userInfo[msg.sender].lastClaimBlockNumber = block.number;
        require(token_.balanceOf(REWARD_TOKEN_WALLET) >= stakingReward, 
            "Reward token is not enough.");
        token_.transferFrom(REWARD_TOKEN_WALLET, msg.sender, stakingReward);
        (bool sent, ) = TREASURY_WALLET.call{value: msg.value}("");
        require(sent == true, "Failed to send BNB");

        emit LogClaimStakingReward(stakingReward);
    }

    function withdraw() external onlyOwner() {
        uint256 amount = address(this).balance;
        require(amount > 0, "Have not BNB");
        (bool sent, ) = payable(msg.sender).call{value:amount}("");
        require(sent == true, "Failed to send BNB");
        emit LogWithdraw(msg.sender, amount);
    }

    /**
     * @notice  Function to receive BNB. msg.data must be empty
     */
    receive() external payable {
        emit LogReceive(msg.sender, msg.value);
    }

    /**
     * @notice  Fallback function is called when msg.data is not empty
     */
    fallback() external payable {
        emit LogFallback(msg.sender, msg.value);
    }
}
