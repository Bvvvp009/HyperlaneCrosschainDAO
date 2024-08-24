import React, { useState, useEffect } from "react";
import { ChakraProvider, Box, Flex, Heading, Spacer, Button, VStack, HStack, Text } from "@chakra-ui/react";
import { createWeb3Modal, defaultConfig,useWeb3ModalProvider, useSwitchNetwork,useWeb3ModalAccount} from '@web3modal/ethers/react'
import { Contract, ethers } from "ethers";
import { useDisclosure } from "@chakra-ui/react";
import { sepolia,scrollsepolia,mainnet } from "./constants/chains";
// import AbiCore from '../../artifacts/contracts/GovernanceCore.sol/GovernanceCore.json'
// import contracts from './constants/contracts.json'
import abiProxy from './constants/abiProxy.json'

// 1. Your WalletConnect Cloud project ID
const projectId = '1e5ee44a755991ef1ebe484d6393252c'

// 2. Set chains


// 3. Create a metadata object
const metadata = {
  name: 'Dao',
  description: 'AppKit Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet,scrollsepolia,sepolia],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
  ,
  '--w3m-color-mix-strength': 40,
  '--w3m-accent':'#D53F8C',
})


const App = () => {
  const [proposals, setProposals] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { walletProvider } = useWeb3ModalProvider();
  const {details} = useWeb3ModalAccount()
console.log(details)

   const abi = [" function getActiveProposals() external view returns (uint256[] memory)"]
  const getActiveProposals = async () => {
    const provider = new ethers.BrowserProvider(walletProvider)
    console.log(provider)
    const contract = new Contract("0xccd91E5D9de98Bb1cd74812edF255D85205a49A0",abi,provider);
    const details =   await contract.getActiveProposals()
    console.log(details[1])
 
    // Dummy function to mimic fetching active proposals
    // Replace with actual call to get active proposals from the contract
    return [
      { id: 1, title: "Proposal 1", status: "Open", chains: ["Ethereum", "Polygon"] },
      { id: 2, title: "Proposal 2", status: "Passed", chains: ["Ethereum"] },
      { id: 3, title: "Proposal 3", status: "Open", chains: ["Polygon", "Arbitrum"] },
    ];
  };


getActiveProposals()

  return (
    <ChakraProvider>
      <Flex direction="column" minH="100vh" bg="pink.100">
        {/* Navigation Bar */}
        <Flex as="header" bg="green.500" p={4} boxShadow="md">
          <Heading color="white" size="lg">
            Hype DAO
          </Heading>
          <Spacer />
          <Button colorScheme="pink" >
          <w3m-button  backgroundColor='pink' balance='show'/>
          </Button>
        </Flex>

        {/* Main Content */}
        <Flex flex="1">
          {/* Side Navigation Bar */}
          <VStack
            as="nav"
            bg="green.400"
            color="white"
            p={4}
            spacing={4}
            align="start"
            width="200px"
            boxShadow="md"
          >
            <Button variant="link" onClick={() => setProposals([])}>List Proposals</Button>
            <Button variant="link" onClick={onOpen}>Create Proposal</Button>
          </VStack>

          {/* Content Area */}
          <Box flex="1" p={6}>
            <Heading size="md" color="green.600" mb={4}>
              Active Proposals
            </Heading>
            <VStack spacing={4} align="stretch">
              {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <Box key={proposal.id} bg="white" p={4} borderRadius="md" boxShadow="md">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{proposal.title}</Text>
                      <Text color="green.500">{proposal.status}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Chains: {proposal.chains.join(", ")}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text>No active proposals found.</Text>
              )}
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default App;
