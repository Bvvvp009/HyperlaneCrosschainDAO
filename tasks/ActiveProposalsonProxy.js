task("get-proposals", "Gets all active proposals")
  .addParam("contract", "The GovernanceCore contract address")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceProxy");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);
    const activeProposals = await governanceCore.getActiveProposals();
    console.log("Active proposals:", activeProposals);

    for (const proposalId of activeProposals) {
      const proposal = await governanceCore.proposals(proposalId);
      console.log(`Proposal ${proposalId}:`, proposal);
    }
    
  });
  
  // npx hardhat --network sepolia get-proposals --contract 0x1C4d29F59d8e603B2403F7C0187781482Db6442B