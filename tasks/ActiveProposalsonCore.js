task("get-proposals", "Gets all active proposals")
  .addParam("contract", "The GovernanceCore contract address")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);
    const activeProposals = await governanceCore.proposals(1);
    console.log("Active proposals:", activeProposals);

    for (const proposalId of activeProposals) {
      const proposal = await governanceCore.proposals(proposalId);
      console.log(`Proposal ${proposalId}:`, proposal);
    }
    
  });
