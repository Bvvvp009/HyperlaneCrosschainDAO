task("add-chains", "Gets all active proposals")
.addParam("contract", "The GovernanceCore contract address")
.addParam("chain", "Chain of proxy address")
.addParam("address", "bytes address of proxy")
.setAction(async (taskArgs, hre) => {
  
  const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
  const governanceCore = await GovernanceCore.attach(taskArgs.contract);
  const addChains = await governanceCore.addSupportedChain(taskArgs.chain,hre.ethers.zeroPadValue(taskArgs.address,32));
  console.log("Chain added:", await addChains.wait());
});

// npx hardhat add-chains --network sepolia --chain-id 534351 --contract 0x1C4d29F59d8e603B2403F7C0187781482Db6442B  --address 0x7ab351416f3394F1660dE6a6a5dCE32EEc736518
