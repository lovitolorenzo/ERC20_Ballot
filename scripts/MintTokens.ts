import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken } from "../typechain-types";
import { MyTokenInterface } from "../typechain-types/contracts/ERC20Votes.sol/MyToken";
import { Wallet } from "ethers";
dotenv.config();
const TOKENS_TO_MINT = ethers.utils.parseEther("1");

interface returnMintTokens {
	accounts: Wallet[];
	contractAbi: MyTokenInterface;
	contractAddress: string;
}

const provider = ethers.getDefaultProvider("goerli");
const { MNEMONIC, RESERVE, RESERVE1, RESERVE3 } = process.env;

const fetchWalletFromMnemonic = (mnemonicArray: (string | undefined)[]): Wallet[] => {
	let walletArray = [];
	for (let e in mnemonicArray) {
		const seed = mnemonicArray[e]; //To fetch the seed from .env we need
		// to set in app.module.ts  under @Module imports: [ConfigModule.forRoot()],
		const wallet = ethers.Wallet.fromMnemonic(seed ? seed : "");
		walletArray.push(wallet.connect(provider));
	}
	return walletArray;
};

export async function mintTokens(): Promise<returnMintTokens> {
	//const [deployer, acc1, acc2, acc3] = await ethers.getSigners(); //WAY TO FETCH SIGNER AND ACCOUNTS OF EVM'S DEPLOYED CONTRACTS

	const [deployer, acc1, acc2, acc3] = fetchWalletFromMnemonic([MNEMONIC, RESERVE, RESERVE1, RESERVE3]);
	console.log({ acc1, acc2, acc3 });
	const myTokenContractFactory = await ethers.getContractFactory("MyToken");
	const estimatedGas = await myTokenContractFactory.signer.estimateGas(myTokenContractFactory.getDeployTransaction());
	console.log(`Estimated gas: ${estimatedGas}`);
	const gasPrice = await myTokenContractFactory.signer.getGasPrice();
	const deploymentPrice = gasPrice.mul(estimatedGas);
	const deployerAddress = await myTokenContractFactory.signer.getAddress();
	console.log(`Signer/Deployer address is: ${deployerAddress}`);
	const deployerBalance = await myTokenContractFactory.signer.getBalance();
	console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
	console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
	if (Number(deployerBalance) < Number(deploymentPrice)) {
		throw new Error("You dont have enough balance to deploy.");
	}

	console.log("myTokenContractFactory.signer is: ", myTokenContractFactory.signer);
	console.log(`This is contract's deployer: ${deployerAddress}`);

	const signers = [deployer, acc1, acc2, acc3];

	const myTokenContract = await myTokenContractFactory.deploy();
	await myTokenContract.deployed();

	console.log(`\nMyToken contract was deployed at the address of ${myTokenContract.address}\n`);

	//HOW TO FETCH CONTRACT ABI TO REDEPLOY IT SOMEWHERE ELSE
	const contractAbi = myTokenContract.interface;
	//console.log(`Contract Abi: ${contractAbi}`)

	const totalSupply = await myTokenContract.totalSupply();
	console.log(`The initial totalSupply of this contract after deployment is ${totalSupply}\n`);

	//console.log("Minting new tokens for Acc1, Acc2 and Acc3\n")
	const mintTx = await myTokenContract.mint(acc1.address, TOKENS_TO_MINT);
	const mintTx1 = await myTokenContract.mint(acc2.address, TOKENS_TO_MINT);
	const mintTx2 = await myTokenContract.mint(acc3.address, TOKENS_TO_MINT);
	await Promise.all([mintTx.wait(), mintTx1.wait(), mintTx2.wait()]);
	console.log({ mintTx });

	const totalSupplyAfter = await myTokenContract.totalSupply();
	console.log(`The totalSupply of this contract after minting is ${ethers.utils.formatEther(totalSupplyAfter)}\n`);

	const acc1BalanceAfterMint = await myTokenContract.balanceOf(acc1.address);
	const acc2BalanceAfterMint = await myTokenContract.balanceOf(acc2.address);
	const acc3BalanceAfterMint = await myTokenContract.balanceOf(acc3.address);
	console.log(`The token balance of acc1 after minting is ${ethers.utils.formatEther(acc1BalanceAfterMint)}\n`);
	console.log(`The token balance of acc2 after minting is ${ethers.utils.formatEther(acc2BalanceAfterMint)}\n`);
	console.log(`The token balance of acc3 after minting is ${ethers.utils.formatEther(acc3BalanceAfterMint)}\n`);

	return { accounts: signers, contractAbi: myTokenContract.interface, contractAddress: myTokenContract.address };
}

// mintTokens()
// 	.then(() => process.exit(0))
// 	.catch((error) => {
// 		console.error(error);
// 		process.exit(1);
// 	});
