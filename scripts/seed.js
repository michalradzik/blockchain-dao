const hre = require("hardhat");
const config = require('../src/config.json');
const { parseUnits } = hre.ethers;

const tokens = (n) => {
  return parseUnits(n.toString(), 'ether');
}

const ether = tokens;

async function main() {
  const accounts = await hre.ethers.getSigners();
  const funder = accounts[0];
  const investor1 = accounts[1];
  const investor2 = accounts[2];
  const investor3 = accounts[3];
  const recipient = accounts[4];

  let transaction;

  const { chainId } = await hre.ethers.provider.getNetwork();

  if (!config[chainId]) {
    console.error(`No configuration found for chain ID: ${chainId}`);
    process.exit(1);
  }

  const tokenAbi = require('../artifacts/contracts/Token.sol/Token.json').abi;
  const tokenAddress = config[chainId]?.token?.address;

  if (!tokenAddress) {
    console.error("Token address is undefined in config.json for the current network.");
    process.exit(1);
  }

  const token = new hre.ethers.Contract(tokenAddress, tokenAbi, funder);

  transaction = await token.transfer(investor1.address, tokens(200000));
  await transaction.wait();

  transaction = await token.transfer(investor2.address, tokens(200000));
  await transaction.wait();

  transaction = await token.transfer(investor3.address, tokens(200000));
  await transaction.wait();

  const daoAbi = require('../artifacts/contracts/DAO.sol/DAO.json').abi;
  const daoAddress = config[chainId]?.dao?.address;

  if (!daoAddress) {
    console.error("DAO address is undefined in config.json for the current network.");
    process.exit(1);
  }

  const dao = new hre.ethers.Contract(daoAddress, daoAbi, funder);

  transaction = await funder.sendTransaction({ to: dao.target, value: ether(1000) });
  await transaction.wait();

  transaction = await token.transfer(daoAddress, tokens(1000000));
  await transaction.wait();

  for (let i = 0; i < 3; i++) {
    transaction = await dao.connect(investor1).createProposal(
      `Proposal ${i + 1}`, 
      `Description for proposal ${i + 1}`, 
      ether(100), 
      recipient.address
    );
    await transaction.wait();

    await dao.connect(investor1).vote(i + 1, true);
    await dao.connect(investor2).vote(i + 1, true);
    await dao.connect(investor3).vote(i + 1, true);

    await dao.connect(investor1).finalizeProposal(i + 1);
  }

  transaction = await dao.connect(investor1).createProposal(
    `Proposal 4`, 
    `Description for proposal 4`, 
    ether(100), 
    recipient.address
  );
  await transaction.wait();

  await dao.connect(investor2).vote(4, true);
  await dao.connect(investor3).vote(4, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
