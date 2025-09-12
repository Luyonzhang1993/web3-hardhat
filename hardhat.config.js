require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
// tasks import
require("./tasks");
require("hardhat-deploy");

const dotenv = require('@chainlink/env-enc');

dotenv.config();

const { SEPOLIA_URL, ETHERSCAN_API_KEY, PRIVATE_KEY, PRIVATE_KEY_1 } = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // defaultNetwork: "hardhat",
    solidity: "0.8.20",
    networks: {
        sepolia: {
            url: SEPOLIA_URL,
            accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
            chainId: 11155111
        }
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY
        }
    },
    sourcify: {
        enabled: true
    },
    namedAccounts: {
        firstAccount: {
            default: 0
        },
        secondAccount: {
            default: 1
        }
    }
};
