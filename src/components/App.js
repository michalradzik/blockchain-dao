import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserProvider, Contract, getAddress, formatUnits } from 'ethers';

import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

import DAO_ABI from '../abis/DAO.json';
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [dao, setDao] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [quorum, setQuorum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    const provider = new BrowserProvider(window.ethereum);
    setProvider(provider);
    const accounts = await provider.send("eth_requestAccounts", []);
    const account = getAddress(accounts[0]);
    setAccount(account);
    const { chainId } = await provider.getNetwork();

    const dao = new Contract(config[chainId]?.dao?.address, DAO_ABI, provider);
    setDao(dao);

    const treasuryBalance = formatUnits(await provider.getBalance(dao.target), 18);
    setTreasuryBalance(treasuryBalance);

    const count = await dao.proposalCount();
    const proposals = [];
    for (let i = 0; i < count; i++) {
      const proposal = await dao.proposals(i + 1);
      proposals.push(proposal);
    }
    setProposals(proposals);
    setQuorum(await dao.quorum());
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Container fluid className="custom-bg text-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-5">
      <Navigation account={account} />

      <h1 className="my-4 text-center text-yellow">Welcome to our DAO!</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Create provider={provider} dao={dao} setIsLoading={setIsLoading} />

          <hr className="border-light" />

          <p className="text-center text-yellow"><strong>Treasury Balance:</strong> {treasuryBalance} ETH</p>

          <hr className="border-light" />

          <Proposals
            provider={provider}
            dao={dao}
            proposals={proposals}
            quorum={quorum}
            setIsLoading={setIsLoading}
          />
        </>
      )}
    </Container>
  );
}

export default App;
