const { task } = require('hardhat/config')
// const {ethers} = require("ethers");

task('interact-fundme', "和 fundme 合约交互")
    .addParam("addr", "fundme contract address")
    .setAction(async (taskArgs, hre) => {
        const fundMeFactory = await ethers.getContractFactory('FundMe');
        const fundMe = await fundMeFactory.attach(taskArgs.addr);

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
})