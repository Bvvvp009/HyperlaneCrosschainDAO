const hre = require("hardhat");
require("dotenv").config();
console.log(process.env.SEPOLIA_RPC_URL, process.env.SCROLL_SEPOLIA_RPC_URL)
async function main() {
  const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
  const governanceToken = "0xbe5a9ae9a6e965fd75a25c7ca6f0349dd378a83f"; // Replace with your governance token address
  const mailbox = "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766"; // Replace with Hyperlane Mailbox address
  const igp = "0x6f2756380FD49228ae25Aa7F2817993cB74Ecc56"; // Replace with Hyperlane IGP address
  const chainId = 11155111

  const governanceCore = await GovernanceCore.deploy(governanceToken, mailbox, igp,chainId);
  await governanceCore.waitForDeployment();

  console.log("GovernanceCore deployed to:",await governanceCore.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//0x33f8CF961d9EA0f4013A0a3a518EeF2B72DeeEF7