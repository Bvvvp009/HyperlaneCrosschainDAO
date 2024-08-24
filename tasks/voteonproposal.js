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

// npx hardhat vote-proposal --network sepolia --contract 0x03D66E8C3b9f3A60dF278AD24AeF0a4836d735AF proposal-id 1 vote true