import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
	solidity: "0.8.17",
	networks: {
		goerli: {
			accounts: [PRIVATE_KEY ? PRIVATE_KEY : ""], //deployer
			url: API_URL,
			blockGasLimit: 100000000429720,
		},
	},
};
