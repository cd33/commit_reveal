import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const CommitReveal = await ethers.getContractFactory("CommitReveal");
  const commitReveal = await CommitReveal.deploy(signerAddress);
  await commitReveal.deployed();
  console.log("Deployed Smart Contract at address", commitReveal.address);

  if (network.name === "goerli") {
    console.log("Verifying the Smart Contract CommitReveal...");
    await commitReveal.deployTransaction.wait(6); // Attendre 6 block après le déploiment
    await verify(commitReveal.address, []);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
