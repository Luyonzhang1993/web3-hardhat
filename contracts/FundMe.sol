// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping (address => uint256) public fundersToAmount;

    uint256 MINIMUM_VALUE = 100 * 10 ** 18;

    uint256 constant TARGET = 1000 * 10 ** 18;

    AggregatorV3Interface public dataFeed;

    uint256 deploymentTimestamp;

    uint256 lockTime;

    address public owner;

    address public erc20Addr;

    bool public getFundSuccess = false;

    event FundWithDrawByOwner(uint256);
    event ReFundWithAccount(address, uint256);

    constructor (uint256 _lockTime, address dataFeedAddr) {
        // sepolia testnet
//        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund () external payable  {
        require(block.timestamp - deploymentTimestamp < lockTime, "Lock time is full.");
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH!");
        fundersToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
        /* uint80 roundId */,
            int256 answer,
        /*uint256 startedAt*/,
        /*uint256 updatedAt*/,
        /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
    // 439732516300

    function convertEthToUsd (uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * (ethPrice / 10 ** 8);
    }

    function transferOwnerShip (address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getFund () external windowClosed onlyOwner {
        require(convertEthToUsd(address(this).balance) > TARGET, "Target is not reached");
        /**
            transfer: transfer and revert if tx failed.
            payable(msg.sender).transfer(address(this).balance);
        */
        /**
            send: transfer eth and return false if failed.
                    bool success = payable(msg.sender).send(address(this).balance);
        */
        /**
            call: transfer eth with data return value of function and bool;
        */
        bool success;
        uint256 balance = address(this).balance;
        (success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
        emit FundWithDrawByOwner(balance);
    }

    function refund () external windowClosed {
        require(convertEthToUsd(address(this).balance) < TARGET, "fund is less than target.");
        uint256 amount = fundersToAmount[msg.sender];
        require(amount != 0, "There is no fund.");
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        emit ReFundWithAccount(msg.sender, balance);
    }

    function getFunderToAmount (address funder) public view returns (uint256) {
        return fundersToAmount[funder];
    }

    function setFunderToAmount (address funder, uint256 amount) external {
        require(msg.sender == erc20Addr, "you do not permission to call this func");
        fundersToAmount[funder] = amount;
    }

    function setErc20Addr (address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed () {
        require(block.timestamp - deploymentTimestamp > lockTime, "Lock time is not full.");
        _;
    }

    modifier onlyOwner () {
        require(msg.sender == owner, "You are not owner. can't call this func");
        _;
    }

}