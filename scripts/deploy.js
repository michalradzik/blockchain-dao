const hre = require("hardhat");
const { parseUnits } = hre.ethers;

async function main() {
  const { ethers } = hre;

  console.log("Starting deployment...");

  const NAME = 'Dapp University';
  const SYMBOL = 'DAPP';
  const INITIAL_SUPPLY = parseUnits('1000000', 18);

  let token;
  try {
    console.log("Deploying Token contract...");
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy(NAME, SYMBOL, INITIAL_SUPPLY);
    
    await token.waitForDeployment(); 

    console.log(`Token deployed successfully to: ${token.target}`);
  } catch (error) {
    console.error("Error deploying Token contract:", error);
    process.exit(1);
  }

  if (!token || !token.target) {
    console.error("Error: Token address is undefined");
    process.exit(1);
  }

  try {
    const QUORUM = parseUnits('300001', 18);

    console.log("Deploying DAO contract...");
    const DAO = await ethers.getContractFactory('DAO');
    const dao = await DAO.deploy(token.target, QUORUM);
    await dao.waitForDeployment();
    console.log(`DAO deployed successfully to: ${dao.target}`);
  } catch (error) {
    console.error("Error deploying DAO contract:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("An error occurred during deployment:", error);
  process.exitCode = 1;
});
