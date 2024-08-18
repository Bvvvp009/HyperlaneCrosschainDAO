const hre = require("hardhat");

async function main() {
  const GovernanceProxy = await hre.ethers.getContractFactory("GovernanceProxy");
  const mailbox = "0x3C5154a193D6e2955650f9305c8d80c18C814A68"; // Replace with Hyperlane Mailbox address
  const governanceToken = "0x7df9A5B92443B96bF876A43f3Af61d0f50bb61A0"; // Replace with your governance token address
  const homeDomain = 11155111; // Replace with the appropriate domain ID
  const homeCoreAddress = "0x00000000000000000000000033f8cf961d9ea0f4013a0a3a518eef2b72deeef7"; // Replace with the address of GovernanceCore on the home chain

  const governanceProxy = await GovernanceProxy.deploy(mailbox, governanceToken, homeDomain, homeCoreAddress);
  await governanceProxy.waitForDeployment();

  console.log("GovernanceProxy deployed to:",await governanceProxy.getAddress());


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hardhat add-chains --chain 534351 --contract 0x33f8CF961d9EA0f4013A0a3a518EeF2B72DeeEF7 --address 0x0000000000000000000000005ace58d7337cf98bf1421a0fbf6139f420169707  --network sepolia
// npx hardhat create-proposal --contract 0x33f8CF961d9EA0f4013A0a3a518EeF2B72DeeEF7 --network sepolia                                  

//0x5aCe58d7337CF98Bf1421a0FbF6139f420169707