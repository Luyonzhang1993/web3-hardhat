const { ethers } = require('hardhat');

const { ETHERSCAN_API_KEY } = process.env

async function main () {
    // create factory
    const fundMeFactory = await ethers.getContractFactory('FundMe');
    // deploy contract from factory
    console.log('contract deploying');
    const fundMe = await fundMeFactory.deploy(120);
    await fundMe.waitForDeployment();
    console.log('contract has been deploy success. contract address target is: ', fundMe.target);

    if (hre.network.config.chainId === 11155111 && ETHERSCAN_API_KEY) {
        await verifyContract(fundMe, [600])
    } else {
        console.log('verification skip.')
    }

    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // fund contract with account1
    const fundTx = await fundMe.connect(firstAccount).fund({ value: ethers.parseEther("0.2") });
    await fundTx.wait();

    // check balance of contract with account1
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`balance of contract: ${balanceOfContract}`);

    // fund contract with account2
    const fundTxWithSecond = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.2") });
    await fundTxWithSecond.wait();

    // check balance of contract with account2
    const balanceOfContractAfter = await ethers.provider.getBalance(fundMe.target);
    console.log('balance of contractAfter: ', balanceOfContractAfter);

    // check mapping of fundersToAmount
    const firstAccountBalance = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountBalance = await fundMe.fundersToAmount(secondAccount.address)
    console.log('funders amount info: ', {
        firstAccountBalance,
        secondAccountBalance
    })
}

async function verifyContract (contract, arguments) {
    console.log('waiting for deployment');
    await contract.deploymentTransaction().wait(5);

    await hre.run("verify:verify", {
        address: contract.target,
        constructorArguments: arguments,
    });
    console.log('verify contract successfully.');
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(0);
    })