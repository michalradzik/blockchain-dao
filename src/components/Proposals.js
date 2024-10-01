import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
  const [proposalData, setProposalData] = useState({});
  const [hasVotedMap, setHasVotedMap] = useState({});

  useEffect(() => {
    const loadVotes = async () => {
      try {
        const proposalMap = {};
        const hasVotedMapTemp = {};

        for (const proposal of proposals) {
          const proposalDetails = await dao.proposals(proposal.id);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          const hasVoted = await dao.hasVoted(proposal.id, userAddress);
          hasVotedMapTemp[proposal.id] = hasVoted;

          proposalMap[proposal.id] = {
            votesFor: proposalDetails.votesFor.toString(),
            votesAgainst: proposalDetails.votesAgainst.toString(),
            finalized: proposalDetails.finalized,
            description: proposalDetails.description,
          };
        }

        setProposalData(proposalMap);
        setHasVotedMap(hasVotedMapTemp);
      } catch (error) {
        console.error('Error loading votes:', error);
      }
    };

    loadVotes();
  }, [dao, proposals, provider]);

  const voteHandler = async (id, isFor) => {
    try {
      const signer = await provider.getSigner();
      const transaction = await dao.connect(signer).vote(id, isFor);
      await transaction.wait();
    } catch (error) {
      console.error('Error during vote:', error);
      window.alert('Transaction reverted or user rejected.');
    }
    setIsLoading(true);
  };

  const finalizeHandler = async (id) => {
    try {
      const signer = await provider.getSigner();
      const transaction = await dao.connect(signer).finalizeProposal(id);
      await transaction.wait();
    } catch (error) {
      console.error('Error finalizing proposal:', error);
      window.alert('Transaction reverted or user rejected.');
    }
    setIsLoading(true);
  };

  return (
    <div>
      <h3 className="text-center mb-3">Quorum: {quorum.toString()} votes</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Proposal Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Votes For</th>
            <th>Votes Against</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal, index) => {
            const votesFor = parseInt(proposalData[proposal.id]?.votesFor || 0);
            const votesAgainst = parseInt(proposalData[proposal.id]?.votesAgainst || 0);
            const status = proposalData[proposal.id]?.finalized ? 'Approved' : 'Pending';

            return (
              <tr key={index}>
                <td>{proposal.id.toString()}</td>
                <td>{proposal.name}</td>
                <td>{proposalData[proposal.id]?.description}</td>
                <td>
                  <Badge bg={status === 'Approved' ? 'success' : 'warning'}>
                    {status}
                  </Badge>
                </td>
                <td>{proposalData[proposal.id]?.votesFor}</td>
                <td>{proposalData[proposal.id]?.votesAgainst}</td>
                <td>
                  {!proposalData[proposal.id]?.finalized && !hasVotedMap[proposal.id] && (
                    <>
                      <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => voteHandler(proposal.id, true)}
                      >
                        Vote For
                      </Button>
                      <Button variant="danger" onClick={() => voteHandler(proposal.id, false)}>
                        Vote Against
                      </Button>
                    </>
                  )}
                  {proposalData[proposal.id]?.finalized === false && votesFor > votesAgainst && (
                    <Button variant="success" onClick={() => finalizeHandler(proposal.id)}>
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
