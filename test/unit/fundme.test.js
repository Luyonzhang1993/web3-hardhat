const { ethers, getNamedAccounts, deployments, network} = require('hardhat');
const { assert, expect } = require('chai');
const { networkConfig, developmentChains} = require('../../helper-hardhat-config');
const helpers = require("@nomicfoundation/hardhat-network-helpers");
require('hardhat-deploy');

// only local network run!
!developmentChains.includes(network.name) ? describe.skip("skip") :
describe("test FundMe contract", async function () {
    let fundMe, fundMeSecondAccount;
    let firstAccount, secondAccount;

    beforeEach(async function () {
        await deployments.fixture('all') // 加上此行，所有deploy脚本都将重新部署。
        firstAccount = (await getNamedAccounts()).firstAccount;
        secondAccount = (await getNamedAccounts()).secondAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);
    })

    it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment();
        const fundMeOwner = await fundMe.owner();
        assert.equal(fundMeOwner, firstAccount);
    })

    it("test if the dataFeed is right", async function () {
        await fundMe.waitForDeployment();
        const dataFeed = await fundMe.dataFeed();

        let dataFeedAddr;
        if (developmentChains.includes(network.name)) {
            const mockDataFeed = await deployments.get("MockV3Aggregator");
            dataFeedAddr = mockDataFeed.address;
        } else {
            dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        }

        assert.equal(dataFeed, dataFeedAddr);
    })

    // fund, getFund, reFund
    // unit test for fund
    // window open, value greater than minimum
    it (
        "window closed, value greater than minimum, fund failed.",
        async function () {
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("Lock time is full.");
        }
    )

    it(
        "window open, value is less than minimum, fund failed.",
        async function () {
            await expect(fundMe.fund({ value: ethers.parseEther("0.01") }))
                .to.be.revertedWith("Send more ETH!");
        }
    )

    it(
        "window open, value is greater than minimum, fund successfully.",
        async function () {
            const fundValue = ethers.parseEther("0.1")
            await fundMe.fund({ value: fundValue })
            const balance = await fundMe.fundersToAmount(firstAccount)
            expect(balance).to.equal(fundValue);
        }
    )

    // unit test for getFund
    // onlyOwner, window closed, target reached
    it(
        "not owner, window closed, target reached, getFund failed",
        async function () {
            const fundValue = ethers.parseEther("1")
            await fundMe.fund({ value: fundValue })

            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMeSecondAccount.getFund())
                .to.be.revertedWith("You are not owner. can't call this func");
        }
    )

    it(
        "window open, target reached, getFund failed",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })
            await expect(fundMe.getFund())
                .to.be.revertedWith("Lock time is not full.");
        }
    )

    it(
        "window closed, target not reached, getFund failed",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMe.getFund())
                .to.be.revertedWith("Target is not reached");
        }
    )

    it(
        "window open, fund more then minimum, fund successfully.",
        async function () {
            await fundMeSecondAccount.fund({ value: ethers.parseEther("0.1") })
            const balance = await fundMe.fundersToAmount(secondAccount)
            expect(balance).to.equal(ethers.parseEther("0.1"))
        }
    )

    it(
        "window closed, target reached, fund successfully.",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMe.getFund())
                .to.emit(fundMe, "FundWithDrawByOwner")
                .withArgs(ethers.parseEther("1"))
        }
    )
})