const { ethers, getNamedAccounts, deployments, network} = require('hardhat');
const { expect } = require('chai');
const { developmentChains} = require('../../helper-hardhat-config');
require('hardhat-deploy');

// only online network run!
developmentChains.includes(network.name) ? describe.skip("skip") :
describe("test FundMe contract", async function () {
    let fundMe;
    let firstAccount;

    beforeEach(async function () {
        await deployments.fixture('all') // 加上此行，所有deploy脚本都将重新部署。
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
    })

    it(
        "test fund and getFund successfully",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.5") });
            await new Promise(resolve => setTimeout(resolve, 181 * 1000));
            // make sure we can get receipt

            const getFundTx = await fundMe.getFund();
            const getFundReceipt = await getFundTx.wait();
            expect(getFundReceipt)
                .to.be.emit(fundMe, "FundWithDrawByOwner")
                .withArgs(ethers.parseEther("0.5"));
        }
    )

    it(
        "test fund and refund successfully",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") });
            await new Promise(resolve => setTimeout(resolve, 181 * 1000));

            const refundTx = await fundMe.refund();
            const refundReceipt = await refundTx.wait();

            expect(refundReceipt)
                .to.be.emit(fundMe, "ReFundWithAccount")
                .withArgs(firstAccount, ethers.parseEther("0.1"));
        }
    )
})