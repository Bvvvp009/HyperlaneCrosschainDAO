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
  
  // npx hardhat --network sepolia get-proposals --contract 0x03D66E8C3b9f3A60dF278AD24AeF0a4836d735AF