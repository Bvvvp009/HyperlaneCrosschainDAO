const hre = require("hardhat");
const mailbox = require('../constants/mailbox.json');
const igpAddress = require('../constants/igpaddress.json');

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const mailboxAddress = mailbox[chainId];
  const governanceTokenAddress = "0x7df9A5B92443B96bF876A43f3Af61d0f50bb61A0";  //governace token address
  const homeDomain = 11155111;
  const homeCoreAddress = "0x03D66E8C3b9f3A60dF278AD24AeF0a4836d735AF" //homeCore Address in bytes32

  console.log("----------------------------------------------------");
  console.log("Deploying GovernanceProxy and waiting for confirmations...");
  const governanceProxy = await deploy("GovernanceProxy", {
    from: deployer,
    args: [mailboxAddress, governanceTokenAddress, homeDomain, hre.ethers.zeroPadValue(homeCoreAddress,32)],
    log: true,
    waitConfirmations: 1,
  });

  console.log("GovernanceProxy deployed at:", governanceProxy.address);
  console.log("----------------------------------------------------");
};

module.exports.tags = ["all","deployProxy"];

//0x17c87634233C3e26DffFDAe63ddFb15bd633A615