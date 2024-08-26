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

// npx hardhat add-chains --network sepolia --chain-id 534351 --contract 0xc55405B2f3a0cD0d6f2Eb5DA838E9EA73421002B  --address 0x40dA3bc1FDbb791f92e689A1b9743B34c0cb5162
