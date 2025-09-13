// const { ethers } = require('hardhat');
module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('this is deploy function.');
    // const [first, second] = await ethers.getSigners();
    // console.log('first', first.address);
    // console.log('second', first.address);
    const { firstAccount } = await getNamedAccounts();
    const { deploy } = deployments;
    await deploy("FundMe", {
        from: firstAccount,
        args: [10],
        log: true
    });
}