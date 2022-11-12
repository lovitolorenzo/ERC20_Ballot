import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { mintTokens } from "./MintTokens";

export async function deployToken(): Promise<{ contractAddress: string; accounts: Wallet[] }> {
	const { accounts, contractAbi, contractAddress } = await mintTokens();
	console.log({ accounts }, { contractAbi }, { contractAddress });

	const [deployer, acc1, acc2, acc3] = accounts;

	//WAY TO FETCH AN EXISTING CONTRACT AVOIDING REDEPLOYING IT AND GRABBING AN EXISTING INSTANCE
	const myTokenContractFactory = await ethers.getContractFactory("MyToken");
	const myTokenContract = myTokenContractFactory.attach(contractAddress);

	//ALTERNATIVE WAY TO FETCH AN EXISTING CONTRACT BY ABI
	//const myTokenContract = new ethers.Contract(contractAddress, contractAbi)
	//console.log(`Retaking contract avoiding redeploying, checking its totalSupply ${ethers.utils.formatEther(await myTokenContract.totalSupply())}\n`)

	//console.log("Delegating from acc1 to acc1\n");
	const delegateTx1 = await myTokenContract.connect(acc1).delegate(acc1.address);

	//console.log("Delegating from acc2 to acc3\n");
	const delegateTx2 = await myTokenContract.connect(acc2).delegate(acc3.address);

	await Promise.all([delegateTx1.wait(), delegateTx2.wait()]);

	const acc1InitialVotingPowerAfterDelegate = await myTokenContract.getVotes(acc1.address);
	console.log(
		`The vote balance of acc1 after self-delegating is ${ethers.utils.formatEther(
			acc1InitialVotingPowerAfterDelegate,
		)}\n`,
	);

	const acc2InitialVotingPowerAfterDelegate = await myTokenContract.getVotes(acc2.address);
	console.log(
		`The vote balance of acc2 after delegating acc3 is ${ethers.utils.formatEther(
			acc2InitialVotingPowerAfterDelegate,
		)}\n`,
	);

	const acc3InitialVotingPowerAfterDelegate = await myTokenContract.getVotes(acc3.address);
	console.log(
		`The vote balance of acc3 after being delegated by acc2 is ${ethers.utils.formatEther(
			acc3InitialVotingPowerAfterDelegate,
		)}\n`,
	);

	return { contractAddress, accounts };
}

// deployToken()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
