task("add-chains", "Gets all active proposals")
.addParam("contract", "The GovernanceCore contract address")
.addParam("chain", "Chain of proxy address")
.addParam("address", "bytes address of proxy")
.setAction(async (taskArgs, hre) => {
  
  const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
  const governanceCore = await GovernanceCore.attach(taskArgs.contract);
  const addChains = await governanceCore.addSupportedChain(taskArgs.chain,hre.ethers.zeroPadValue(taskArgs.address,32));
  console.log("Chain added:", addChains);
});