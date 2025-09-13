const { network} = require("hardhat");
const {
    developmentChains,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS
} = require('../helper-hardhat-config');

const { ETHERSCAN_API_KEY } = process.env

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('this is FundMe contract deploy function.');
    const { firstAccount } = await getNamedAccounts();
    const { deploy } = deployments;

    let dataFeedAddr;
    let confirmations;
    if (developmentChains.includes(network.name)) {
        const mockDataFeed = await deployments.get("MockV3Aggregator");
        dataFeedAddr = mockDataFeed.address;
        console.log('hardhat mock contract address: ', { dataFeedAddr })
        confirmations = 0
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        confirmations = CONFIRMATIONS
    }

    console.log('部署人', firstAccount);
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    });

    if (hre.network.config.chainId === 11155111 && ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    }

}

module.exports.tags = ["all", "fundMe"];
