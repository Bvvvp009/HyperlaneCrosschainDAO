import React, { useState, useEffect } from "react";
import { ChakraProvider, Box, Flex, Heading, Spacer, Button, VStack, HStack, Text, FormControl, FormLabel, Input, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast } from "@chakra-ui/react";
import { createWeb3Modal, defaultConfig, useWeb3ModalProvider, useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { Contract, ethers } from "ethers";
import { sepolia, scrollsepolia, mainnet } from "./constants/chains";

const projectId = '1e5ee44a755991ef1ebe484d6393252c'

const metadata = {
  name: 'Dao',
  description: 'AppKit Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: '...',
  defaultChainId: 1,
})

createWeb3Modal({
  ethersConfig,
  chains: [mainnet, scrollsepolia, sepolia],
  projectId,
  enableAnalytics: true,
  '--w3m-color-mix-strength': 40,
  '--w3m-accent': '#D53F8C',
})

const App = () => {
  const [proposals, setProposals] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { walletProvider } = useWeb3ModalProvider();
  const { details } = useWeb3ModalAccount();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const abi = [
    "function getActiveProposals() external view returns (tuple(uint256 id, address proposer, string description, uint256 forVotes, uint256 againstVotes, uint256 startTime, bool executed, uint32 executionChain, address target, bytes callData)[] memory)",
    "function createProposal(string memory description, uint32 executionChain, address target, bytes memory callData) external payable",
    "function vote(uint256 proposalId, bool support) external"
  ];

  const contractAddress = "0xc55405B2f3a0cD0d6f2Eb5DA838E9EA73421002B";

  const getActiveProposals = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new Contract(contractAddress, abi, provider);
      
      const activeProposals = await contract.getActiveProposals();
      
      const proposalsData = activeProposals.map(proposal => ({
        id: Number(proposal.id),
        proposer: proposal.proposer,
        description: proposal.description,
        forVotes: Number(proposal.forVotes),
        againstVotes: Number(proposal.againstVotes),
        startTime: Number(proposal.startTime),
        executed: proposal.executed,
        executionChain: Number(proposal.executionChain),
        target: proposal.target,
        callData: proposal.callData
      }));

      setProposals(proposalsData);

      if (proposalsData.length === 0) {
        toast({
          title: "No active proposals",
          description: "There are currently no active proposals.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error in getActiveProposals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch proposals. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProposal = async (description, executionChain, target, callData) => {
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      await contract.createProposal(description, executionChain, target, callData);
      onClose();
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getActiveProposals();
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const vote = async (proposalId, support) => {
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      await contract.vote(proposalId, true);
      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully recorded.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getActiveProposals();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: error.reason,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const CreateProposalModal = () => {
    const [description, setDescription] = useState("");
    const [executionChain, setExecutionChain] = useState("");
    const [target, setTarget] = useState("");
    const [callData, setCallData] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      createProposal(description, parseInt(executionChain), target, callData);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Execution chain</FormLabel>
                <Input type="number" value={executionChain} onChange={(e) => setExecutionChain(e.target.value)} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Target contract</FormLabel>
                <Input value={target} onChange={(e) => setTarget(e.target.value)} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Call Data</FormLabel>
                <Input value={callData} onChange={(e) => setCallData(e.target.value)} />
              </FormControl>
              
              <Button mt={4} colorScheme="green" type="submit">Create Proposal</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const VotingScreen = ({ proposal, onClose }) => {
    return (
      <Modal isOpen={!!proposal} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Proposal Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text><strong>Description:</strong> {proposal?.description}</Text>
            <Text mt={2}><strong>Proposer:</strong> {proposal?.proposer}</Text>
            <Text mt={2}><strong>Execution Chain:</strong> {proposal?.executionChain}</Text>
            <Text mt={2}><strong>Target Contract:</strong> {proposal?.target}</Text>
            <Text mt={2}><strong>Call Data:</strong> {proposal?.callData}</Text>
            <Text mt={2}><strong>For:</strong> {((`${proposal?.forVotes}`))}</Text>
            <Text><strong>Against:</strong> {proposal?.againstVotes}</Text>
            <Text mt={2}><strong>Start Time:</strong> {new Date(proposal?.startTime * 1000).toLocaleString()}</Text>
            <Text><strong>Executed:</strong> {proposal?.executed ? "Yes" : "No"}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={() => vote(proposal.id, true)}>
              Vote For
            </Button>
            <Button colorScheme="red" onClick={() => vote(proposal.id, false)}>
              Vote Against
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minH="100vh" bg="pink.100">
        <Flex as="header" bg="blue.600" p={4} boxShadow="md">
          <Heading color="pink.600" size="lg">
            Hype DAO
          </Heading>
          <Spacer />
          <Button colorScheme="pink">
            <w3m-button backgroundColor='pink' balance='show'/>
          </Button>
        </Flex>

        <Flex flex="1">
          <VStack
            as="nav"
            bg="blue.400"
            color="white"
            p={4}
            spacing={4}
            align="start"
            width="200px"
            boxShadow="md"
          >
            <Button variant="link" color="black" onClick={getActiveProposals}>List Proposals</Button>
            <Button variant="link" color="black" onClick={onOpen}>Create Proposal</Button>
          </VStack>

          <Box flex="1" p={6}>
        <Heading size="md" color="pink.600" mb={4}>
          Active Proposals
        </Heading>
        {isLoading ? (
          <Text>Loading proposals...</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <Box key={proposal.id} bg="white" p={4} borderRadius="md" boxShadow="md" cursor="pointer" onClick={() => setSelectedProposal(proposal)}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Proposal {proposal.id}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {proposal.description.substring(0, 100)}...
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    For: {proposal.forVotes} | Against: {proposal.againstVotes}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Proposer: {proposal.proposer.substring(0, 6)}...{proposal.proposer.substring(38)}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Start Time: {new Date(proposal.startTime * 1000).toLocaleString()}
                  </Text>
                </Box>
              ))
            ) : (
              <Text>No active proposals found.</Text>
            )}
          </VStack>
        )}
      </Box>
        </Flex>
      </Flex>
      <CreateProposalModal />
      <VotingScreen proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
    </ChakraProvider>
  );
};

export default App;