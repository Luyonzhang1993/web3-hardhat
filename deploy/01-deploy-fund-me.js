const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('this is deploy function.');
    // const [first, second] = await ethers.getSigners();
    // console.log('first', first.address);
    // console.log('second', first.address);
    const firstAccount = (await getNamedAccounts()).firstAccount;
    console.log('firstAccount', firstAccount);
}
