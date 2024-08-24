require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require('./tasks/createProposal')
require('./tasks/voteonproposal')
//require('./tasks/addachain')
// require('./tasks/ActiveProposalsonCore')
require('./tasks/ActiveProposalsonProxy')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      maxFeePerGas: "auto",
      maxPriorityFeePerGas: "auto",
    },
    scrollSepolia: {
      url: process.env.SCROLL_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      maxFeePerGas: "auto",
      maxPriorityFeePerGas: "auto",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};


// task("create-proposal", "Creates a test proposal")
//   .addParam("contract", "The GovernanceCore contract address")
//   .setAction(async (taskArgs, hre) => {
//     const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
//     const governanceCore = await GovernanceCore.attach(taskArgs.contract);

//     const description = "Test Proposal 1";
//     const executionChain = 534351; // Replace with the appropriate chain ID
//     const target = "0x5aCe58d7337CF98Bf1421a0FbF6139f420169707"; // Replace with the target address
//     const callData = "0x"; // Replace with the call data

//     const tx = await governanceCore.createProposal(description, executionChain, target, callData, { value: hre.ethers.parseEther("0.05") });
//     await tx.wait();

//    setTimeout(async()=>{

//     const checkStatus = await queryGraphQL({search:await tx?.hash})

//     console.log(checkStatus)
    
//   },30000)

//     console.log("Proposal created, transaction hash:", tx.hash);
//   });

// task("get-proposals", "Gets all active proposals")
//   .addParam("contract", "The GovernanceCore contract address")
//   .setAction(async (taskArgs, hre) => {
//     const GovernanceCore = await hre.ethers.getContractFactory("GovernanceProxy");
//     const governanceCore = await GovernanceCore.attach(taskArgs.contract);

//     const activeProposals = await governanceCore.proposals(1);
//     console.log("Active proposals:", activeProposals);

//     for (const proposalId of activeProposals) {
//       const proposal = await governanceCore.proposals(proposalId);
//       console.log(`Proposal ${proposalId}:`, proposal);
//     }
//   });

//   task("add-chains", "Gets all active proposals")
//   .addParam("contract", "The GovernanceCore contract address")
//   .addParam("chain", "Chain of proxy address")
//   .addParam("address", "bytes address of proxy")
//   .setAction(async (taskArgs, hre) => {
    
//     const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
//     const governanceCore = await GovernanceCore.attach(taskArgs.contract);
//     const addChains = await governanceCore.addSupportedChain(taskArgs.chain,hre.ethers.zeroPadValue(taskArgs.address,32));
//     console.log("Chain added:", addChains);
//   });

//   task("vote-proposal", "Lets vote on proposals")
//   .addParam("contract", "The contract address")
//   .addParam("proposalId", "Id of the proposal")
//   .addParam("vote", "vote for/againest")
//   .setAction(async (taskArgs, hre) => {
//     const GovernanceCore = await hre.ethers.getContractFactory("GovernanceProxy");
//     const governanceCore = await GovernanceCore.attach(taskArgs.contract);
//     const activeProposals = await governanceCore.vote(taskArgs.proposalId,taskArgs.vote);
//     console.log("Adde proposals:", activeProposals);
//   });


  //npx hardhat vote-proposal --contract 0x5aCe58d7337CF98Bf1421a0FbF6139f420169707 --proposal-id 2 --vote true --network scrollSepolia
 