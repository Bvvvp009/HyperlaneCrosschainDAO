const hre = require("hardhat");
require("dotenv").config();
const mailboxAddress = require('../constants/mailbox.json');
const igpAddress = require('../constants/igpaddress.json');


module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

   const governanceToken = "0xbe5a9ae9a6e965fd75a25c7ca6f0349dd378a83f"; // Replace with your governance token address
  const mailbox =  mailboxAddress[chainId] // Replace with Hyperlane Mailbox address
  const igp = igpAddress[chainId] // Replace with Hyperlane IGP address
  console.log(governanceToken,mailbox,igp,chainId)
  console.log("----------------------------------------------------");
  console.log("Deploying GovernanceCore and waiting for confirmations...");
  const governanceCore = await deploy("GovernanceCore", {
    from: deployer,
    args: [governanceToken, mailbox, igp, chainId],
    log: true,
    waitConfirmations: 5,
    
  });

  console.log("GovernanceCore deployed at:", governanceCore.address);
  console.log("----------------------------------------------------");
};

module.exports.tags = ["all", "deployCore"];


//0x7201cc55ce8d1091cd708bcd7f7dda19b3403bce