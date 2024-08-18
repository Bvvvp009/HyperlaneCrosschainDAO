require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    scrollSepolia: {
      url: process.env.SCROLL_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};


task("create-proposal", "Creates a test proposal")
  .addParam("contract", "The GovernanceCore contract address")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);

    const description = "Test Proposal 1";
    const executionChain = 534351; // Replace with the appropriate chain ID
    const target = "0x5aCe58d7337CF98Bf1421a0FbF6139f420169707"; // Replace with the target address
    const callData = "0x00"; // Replace with the call data

    const tx = await governanceCore.createProposal(description, executionChain, target, callData, { value: hre.ethers.parseEther("0.05") });
    await tx.wait();

    // const checkStatus = await queryGraphQL({search:await tx?.hash})

    // // startPolling(checkStatus.description)

    // console.log(checkStatus)

    console.log("Proposal created, transaction hash:", tx.hash);
  });

task("get-proposals", "Gets all active proposals")
  .addParam("contract", "The GovernanceCore contract address")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceProxy");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);

    const activeProposals = await governanceCore.proposals(2);
    console.log("Active proposals:", activeProposals);

    for (const proposalId of activeProposals) {
      const proposal = await governanceCore.proposals(proposalId);
      console.log(`Proposal ${proposalId}:`, proposal);
    }
  });

  task("add-chains", "Gets all active proposals")
  .addParam("contract", "The GovernanceCore contract address")
  .addParam("chain", "Chain of proxy address")
  .addParam("address", "bytes address of proxy")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);
    const activeProposals = await governanceCore.addSupportedChain(taskArgs.chain,taskArgs.address);
    console.log("Adde proposals:", activeProposals);

  });

  task("vote-proposal", "Lets vote on proposals")
  .addParam("contract", "The contract address")
  .addParam("proposalId", "Id of the proposal")
  .addParam("vote", "vote for/againest")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceProxy");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);
    const activeProposals = await governanceCore.vote(taskArgs.proposalId,taskArgs.vote);
    console.log("Adde proposals:", activeProposals);

  });

  //npx hardhat vote-proposal --contract 0x5aCe58d7337CF98Bf1421a0FbF6139f420169707 --proposal-id 2 --vote true --network scrollSepolia
 