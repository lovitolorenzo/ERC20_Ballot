import { ethers } from "ethers";
//To import ABI from Contract's Json we need to set first ""resolveJsonModule": true" in tsconfig.json/"compilerOptions"
import * as TokenJson from "../assets/MyToken.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //Lesson 12's Contract

async function main() {
	const provider = ethers.getDefaultProvider("goerli");
	const contract = new ethers.Contract(
		CONTRACT_ADDRESS,
		TokenJson.abi, //ABI's contract fetched by the Json of the Contract
		provider,
	);

	const seed = "brother tell boil office split level page budget ripple inch still cute"; //To fetch the seed from .env we need
	// to set in app.module.ts  under @Module imports: [ConfigModule.forRoot()],

	const tokensAmount = "5";
	const wallet = ethers.Wallet.fromMnemonic(seed);
	const signer = wallet.connect(provider);
	const signedContract = contract.connect(signer);
	console.log({ signedContract });
	// console.log({ signer });
	// console.log({ signedContract });
	//const totalSupplyBN = await contract.totalSupply();
	//const totalSupply = ethers.utils.formatEther(totalSupplyBN);
	//console.log({ totalSupplyBN });
	const tx = await signedContract.mint(signer.address, ethers.utils.parseEther(tokensAmount.toString()));
	console.log({ tx });
	console.log(await signedContract.totalSupply());
	return { tx };
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
