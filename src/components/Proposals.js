import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
  const [proposalData, setProposalData] = useState({});
  const [recipientBalances, setRecipientBalances] = useState({});

  useEffect(() => {
    const loadVotesAndBalances = async () => {
      try {
        const proposalMap = {};
        const balanceMap = {};

        for (const proposal of proposals) {
          // Pobieranie szczegółów propozycji
          const proposalDetails = await dao.proposals(proposal.id);

          // Pobieranie salda odbiorcy
          const recipientBalance = await provider.getBalance(proposal.recipient);
          balanceMap[proposal.recipient] = ethers.utils.formatEther(recipientBalance);

          proposalMap[proposal.id] = {
            votesFor: proposalDetails.votesFor.toString(),
            votesAgainst: proposalDetails.votesAgainst.toString(),
            finalized: proposalDetails.finalized,
            description: proposalDetails.description
          };
        }

        setProposalData(proposalMap);
        setRecipientBalances(balanceMap);
      } catch (error) {
        console.error("Error loading votes or balances:", error);
      }
    };

    loadVotesAndBalances();
  }, [dao, proposals, provider]);

  const voteHandler = async (id, isFor) => {
    try {
      const signer = await provider.getSigner();
      const transaction = await dao.connect(signer).vote(id, isFor);
      await transaction.wait();
    } catch (error) {
      console.error('Error occurred during the vote transaction:', error);
      window.alert('User rejected or transaction reverted');
    }
    setIsLoading(true);
  };

  const finalizeHandler = async (id) => {
    try {
      const signer = await provider.getSigner();
      const transaction = await dao.connect(signer).finalizeProposal(id);
      await transaction.wait();
    } catch {
      window.alert('User rejected or transaction reverted');
    }
    setIsLoading(true);
  };

  return (
    <div>
      <h3>Quorum: {quorum.toString()} votes</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Proposal Name</th>
            <th>Description</th>
            <th>Recipient Address</th>
            <th>Recipient Balance (ETH)</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Votes For</th>
            <th>Votes Against</th>
            <th>Cast Vote For</th>
            <th>Cast Vote Against</th>
            <th>Finalize</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal, index) => {
            const votesFor = parseInt(proposalData[proposal.id]?.votesFor || 0);
            const votesAgainst = parseInt(proposalData[proposal.id]?.votesAgainst || 0);
            const totalVotes = votesFor + votesAgainst;
            const quorumMet = totalVotes >= quorum;
            const votesForGreaterThanVotesAgainst = votesFor > votesAgainst;

            // Pobieranie salda odbiorcy z mapy
            const recipientBalance = recipientBalances[proposal.recipient];

            return (
              <tr key={index}>
                <td>{proposal.id.toString()}</td>
                <td>{proposal.name}</td>
                <td>{proposalData[proposal.id]?.description}</td>
                <td>{proposal.recipient}</td>
                <td>{recipientBalance} ETH</td>
                <td>{ethers.utils.formatUnits(proposal.amount, 'ether')} ETH</td>
                <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
                <td>{proposalData[proposal.id]?.votesFor}</td>
                <td>{proposalData[proposal.id]?.votesAgainst}</td>
                <td>
                  {!proposal.finalized && (
                    <Button
                      variant="primary"
                      style={{ width: '100%' }}
                      onClick={() => voteHandler(proposal.id, true)}
                    >
                      Vote For
                    </Button>
                  )}
                </td>
                <td>
                  {!proposal.finalized && (
                    <Button
                      variant="danger"
                      style={{ width: '100%' }}
                      onClick={() => voteHandler(proposal.id, false)}
                    >
                      Vote Against
                    </Button>
                  )}
                </td>
                <td>
                  {!proposal.finalized &&
                    votesForGreaterThanVotesAgainst &&
                    quorumMet && (
                      <Button
                        variant="success"
                        style={{ width: '100%' }}
                        onClick={() => finalizeHandler(proposal.id)}
                      >
                        Finalize
                      </Button>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Proposals;
