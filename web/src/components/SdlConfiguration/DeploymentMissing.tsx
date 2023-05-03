import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

interface DeploymentMissingProps {
  dseq: string;
}

export const DeploymentMissing: React.FC<DeploymentMissingProps> = ({ dseq }) => {
  const navigate = useNavigate();
  return (
    <DeploymentMissingWrapper>
      <span>We can't find any information about deployment</span>
      <Dseq onClick={() => navigate(-1)}>{`${dseq}.`}</Dseq>
      <span>Please try later</span>
    </DeploymentMissingWrapper>
  );
};

const DeploymentMissingWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Dseq = styled.span`
  color: red;
  padding: 0 5px;
  cursor: pointer;
  text-decoration: underline;
`;
