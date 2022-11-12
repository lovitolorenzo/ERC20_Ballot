import { ethers } from "hardhat";
import { deployToken } from "./DeployToken";

export function convertStringArrayToBytes32(array: string[]) {
	const bytes32Array = [];
	for (let index = 0; index < array.length; index++) {
		bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
	}
	return bytes32Array;
}

async function main() {
	const { contractAddress, accounts } = await deployToken();
	const [deployer, acc1, acc2, acc3] = accounts;
	console.log("Deployer is: ", deployer, "\n");

	console.log("MyToken Contract address is: ", contractAddress, "\n");
	const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

	let currentBlock = await ethers.provider.getBlock("latest");
	console.log(`The current Block Number is ${currentBlock.number}\n`);

	const TokenizedBallotFactory = await ethers.getContractFactory("TokenizedBallot");
	const TokenizedBallot = await TokenizedBallotFactory.deploy(
		convertStringArrayToBytes32(PROPOSALS),
		contractAddress,
		currentBlock.number,
	);
	await TokenizedBallot.deployed();
	console.log("TokenizedBallot Contract address is: ", TokenizedBallot.address, "\n");

	// Check account vote power
	console.log("Check account vote power: ", await TokenizedBallot.votePower(acc1.address), "\n");
	console.log("Check account vote power spent: ", await TokenizedBallot.votePowerSpent(acc1.address), "\n");

	const acc1VoteChoice: number = 1;
	const acc3VoteChoice: number = 1;

	console.log(`Voting with acc1 on ${acc1VoteChoice}\n`);
	const VoteTx1 = await TokenizedBallot.connect(acc3).vote(acc1VoteChoice, ethers.utils.parseEther("1"));

	console.log(`Voting with acc3 on ${acc3VoteChoice}\n`);
	const VoteTx2 = await TokenizedBallot.connect(acc3).vote(acc3VoteChoice, ethers.utils.parseEther("1"));

	await Promise.all([VoteTx1.wait(), VoteTx2.wait()]);

	console.log(`Acc1 vote transaction hash is: ${VoteTx1.hash}\nWhile transaction full body is: `, VoteTx1, "\n");
	console.log(`Acc1 vote transaction hash is: ${VoteTx1.hash}\nWhile transaction full body is: `, VoteTx2, "\n");

	const winningProposal = await TokenizedBallot.winningProposal();
	const winnerName = ethers.utils.parseBytes32String(winningProposal.name); //!! nota
	const winnerVotesAmount = ethers.utils.formatEther(winningProposal.voteCount); // !! nota
	console.log(`Winner of the Ballot is: ${winnerName}\nWith ${winnerVotesAmount} amount of votes\n`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
