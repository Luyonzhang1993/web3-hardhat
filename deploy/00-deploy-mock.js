const { DECIMALS, INITIAL_ANSWER, developmentChains} = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (developmentChains.includes(network.name)) {
        console.log('this is Mock Contract deploy function.');
        const { firstAccount } = await getNamedAccounts();
        const { deploy } = deployments;
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        });
    } else {
        console.log('env is not local. mock contract deploy skip.')
    }
}

module.exports.tags = ["all", "mock"];