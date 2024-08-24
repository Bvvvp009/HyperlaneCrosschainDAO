// const hre = require("hardhat");

// async function main() {
//   const [deployer] = await hre.ethers.getSigners();

//   console.log("Deploying contracts with the account:", deployer.address);

//   const initialSupply = hre.ethers.parseEther("100000000"); // 1 million tokens

//   const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
//   const governanceToken = await GovernanceToken.deploy(initialSupply);

//   await governanceToken.waitForDeployment();

//   console.log("GovernanceToken deployed to:", await governanceToken.getAddress());
//   console.log("Initial supply:", hre.ethers.formatEther(initialSupply), "GOV");

//   // Verify the contract on Etherscan
//   // if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
//   //   console.log("Waiting for block confirmations...");
//   //   await governanceToken.deployTransaction.wait(6); // wait for 6 block confirmations
    
//   //   console.log("Verifying contract...");
//   //   await hre.run("verify:verify", {
//   //     address: governanceToken.address,
//   //     constructorArguments: [initialSupply],
//   //   });
//   // }
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });