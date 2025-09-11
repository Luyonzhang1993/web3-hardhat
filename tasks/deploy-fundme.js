const { task } = require('hardhat/config')
const dotenv = require('@chainlink/env-enc');

dotenv.config();

const { ETHERSCAN_API_KEY } = process.env

task("deploy-fundme", "部署fundme合约的任务").setAction(async (taskArgs, hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory('FundMe');
    // deploy contract from factory
    console.log('contract deploying');
    const fundMe = await fundMeFactory.deploy(180);
    await fundMe.waitForDeployment();
    console.log('contract has been deploy success. contract address target is: ', fundMe.target);

    if (hre.network.config.chainId === 11155111 && ETHERSCAN_API_KEY) {
        await verifyContract(fundMe, [600])
    } else {
        console.log('verification skip.')
    }
})

async function verifyContract (contract, arguments) {
    console.log('waiting for deployment');
    await contract.deploymentTransaction().wait(5);

    await hre.run("verify:verify", {
        address: contract.target,
        constructorArguments: arguments,
    });
    console.log('verify contract successfully.');
}