This project implements a decentralized autonomous organization (DAO) using Solidity, with support for ERC-20 tokens. It enables users to create proposals, vote on them, and manage a DAO's funds with governance through token-based voting.

Overview
The DAO contracts manage:

Proposals that are submitted by token holders (investors).
Voting on these proposals by other token holders.
Finalizing proposals that meet the required quorum.
In this system, governance is token-based. Token holders can propose and vote, while the DAO treasury holds Ether for funding proposals once they pass.

Smart Contracts
1. DAO Contract
Propose: Token holders can create a proposal.
Vote: Token holders can vote For or Against any proposal.
Finalize: If the quorum is met and the votes For exceed votes Against, the proposal is executed, and the requested funds are transferred to the recipient.
2. MyGovernor Contract
Implements governance features such as proposal creation, voting, and finalization. It integrates with OpenZeppelin's Governor contracts and allows the DAO to operate smoothly using an ERC-20 token.
3. MyToken Contract
A standard ERC-20 token used to facilitate voting within the DAO. Token holders use these tokens to vote on proposals, and their voting weight is proportional to their token balance.
4. Token Contract
This contract is an implementation of a custom ERC-20 token. It provides basic functionalities such as:
Transfer: Token holders can transfer tokens to another address.
Approve: Token holders can approve an allowance for another address to spend tokens on their behalf.
Transfer From: Allows a third party (approved spender) to transfer tokens from one address to another, based on the previously set allowance.
The contract includes standard events such as Transfer and Approval to log transfers and approvals respectively.
The Token contract is initialized with a name, symbol, and total supply. The total supply is minted to the contract deployer's account when the contract is created.
Installation
Clone the repository: First, clone the project repository from the version control system and navigate to the project's directory.

Install dependencies: Install the necessary packages and libraries required for the project to run.

Compile contracts: Compile the Solidity smart contracts to ensure they are ready for deployment.

Deployment
To deploy the contracts to a local or test network:

Configure the network settings in the project's configuration file.
Use the provided deployment scripts to deploy the MyToken, DAO, and Token contracts to the desired network.
Usage
Creating Proposals: Token holders can create proposals by interacting with the DAO contract. Proposals require a name, description, funding amount, and the recipient's address.

Voting: Once a proposal is created, token holders can vote either For or Against using their tokens.

Finalizing: When a proposal reaches the quorum and has more votes For than Against, it can be finalized, transferring the requested amount to the recipient.

Frontend
A simple React frontend is included for interacting with the DAO. It allows users to:

View the current proposals.
Vote on proposals.
Create new proposals.
To start the frontend:

Go to the frontend directory.
Install the frontend's required dependencies.
Start the frontend interface to interact with the deployed DAO contracts.
Tests
To run the test suite:

Run the test suite included in the project to verify the proper functionality of the DAO smart contracts.
The test suite covers various scenarios such as:

Creating proposals.
Voting by token holders.
Finalizing proposals after reaching the quorum.
Testing token transfers, approvals, and allowances.
Features
Token-based governance with ERC-20 tokens.
OpenZeppelin Governor contract extensions for flexible voting.
Quorum-based finalization.
Custom ERC-20 token implementation.
Supports multiple token holders and allows for a decentralized decision-making process.
Technologies Used
Solidity (Smart contracts)
Hardhat (Development environment)
Ethers.js (Blockchain interaction)
React (Frontend)