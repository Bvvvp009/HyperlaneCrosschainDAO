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