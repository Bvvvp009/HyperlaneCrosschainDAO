task("create-proposal", "Creates a test proposal")
  .addParam("contract", "The GovernanceCore contract address")
  .setAction(async (taskArgs, hre) => {
    const GovernanceCore = await hre.ethers.getContractFactory("GovernanceCore");
    const governanceCore = await GovernanceCore.attach(taskArgs.contract);

    const description = "Test Proposal 1"; //Proposal Description
    const executionChain = 534351; // Replace with the appropriate chain ID
    const target = "0x5aCe58d7337CF98Bf1421a0FbF6139f420169707"; // Replace with the target address
    const callData = "0x"; // Replace with the call data

    const tx = await governanceCore.createProposal(description, executionChain, target, callData, { value: hre.ethers.parseEther("0.05") });
    await tx.wait();
    
   setTimeout(async()=>{

    const checkStatus = await queryGraphQL({search:await tx?.hash})

    console.log(checkStatus)
    
  },30000)

    console.log("Proposal created, transaction hash:", tx.hash);
  });

  // npx hardhat --network sepolia create-proposal --contract 0x03D66E8C3b9f3A60dF278AD24AeF0a4836d735AF