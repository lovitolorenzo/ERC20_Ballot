import { ethers } from "hardhat";
import * as dotenv from "dotenv";

const TOKENS_MINTED = ethers.utils.parseEther("1");

async function main() {
	const [deployer, acc1, acc2] = await ethers.getSigners();

	const myTokenContractFactory = await ethers.getContractFactory("MyToken");
	const myTokenContract = await myTokenContractFactory.deploy();
	await myTokenContract.deployed();

	console.log(`\nMyToken contract was deployed at the address of ${myTokenContract.address}\n`);

	const totalSupply = await myTokenContract.totalSupply();
	console.log(`The initial totalSupply of this contract after deployment is ${totalSupply}\n`);

	console.log("Minting new tokens for Acc1\n");
	const mintTx = await myTokenContract.mint(acc1.address, TOKENS_MINTED);
	await mintTx.wait();

	const totalSupplyAfter = await myTokenContract.totalSupply();
	console.log(`The totalSupply of this contract after minting is ${ethers.utils.formatEther(totalSupplyAfter)}\n`);

	console.log("What is the current votePower of acc1?\n");
	const acc1InitialVotingPowerAfterMint = await myTokenContract.getVotes(acc1.address);
	console.log(
		`The vote balance of acc1 after minting is ${ethers.utils.formatEther(acc1InitialVotingPowerAfterMint)}\n`,
	);

	const acc1BalanceAfterMint = await myTokenContract.balanceOf(acc1.address);
	console.log(`The token balance of acc1 after minting is ${ethers.utils.formatEther(acc1BalanceAfterMint)}\n`);

	console.log("Delegating from acc1 to acc1\n");
	const delegateTx = await myTokenContract.connect(acc1).delegate(acc1.address);
	await delegateTx.wait();
	const acc1InitialVotingPowerAfterDelegate = await myTokenContract.getVotes(acc1.address);
	console.log(
		`The vote balance of acc1 after self-delegating is ${ethers.utils.formatEther(
			acc1InitialVotingPowerAfterDelegate,
		)}\n`,
	);

	let currentBlock = await ethers.provider.getBlock("latest");
	console.log(`The current Block Number is ${currentBlock.number}\n`);

	const mintTx2 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
	await mintTx2.wait();
	currentBlock = await ethers.provider.getBlock("latest");
	console.log(`The current Block Number is ${currentBlock.number}\n`);

	const mintTx3 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
	await mintTx3.wait();
	currentBlock = await ethers.provider.getBlock("latest");
	console.log(`The current Block Number is ${currentBlock.number}\n`);

	const pastVotes = await Promise.all([
		myTokenContract.getPastVotes(acc1.address, 4),
		myTokenContract.getPastVotes(acc1.address, 3),
		myTokenContract.getPastVotes(acc1.address, 2),
		myTokenContract.getPastVotes(acc1.address, 1),
		myTokenContract.getPastVotes(acc1.address, 0),
	]);
	console.log({ pastVotes });
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
