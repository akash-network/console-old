import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { truncate } from 'lodash';
import React from 'react';
import CheckedImage from '../../assets/images/checkmark-red.svg';
import { Template } from '../SdlConfiguration/settings';

export interface WalletDeployButtonProps {
  selected: Template | undefined;
  typology: Template;
  onButtonSelect: (template: Template) => void;
  index: number;
  length: number;

  [key: string]: any;
}

export const WalletDeployButtons: React.FC<WalletDeployButtonProps> = ({
  selected,
  typology,
  onButtonSelect,
  index,
  length,
  ...field
}) => {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <WalletDeployButtonWrapper
        checked={selected?.title === typology.title}
        length={length}
        onClick={() => onButtonSelect(typology)}
      >
        <WalletDeployHeadline>
          <WalletDeployButtonTitle>{typology.title}</WalletDeployButtonTitle>
          {selected?.title === typology.title && (
            <WalletCheckmarkButton
              id={typology.title}
              src={CheckedImage}
              checked={selected.title === typology.title}
              onChange={({ currentTarget }) => onButtonSelect(typology)}
            />
          )}
        </WalletDeployHeadline>
        <WalletDeployButtonDescription>
          {truncate(typology.description, {
            length: 200,
            separator: '...',
          })}
        </WalletDeployButtonDescription>
      </WalletDeployButtonWrapper>
    </Box>
  );
};

const WalletDeployButtonWrapper = styled.div<{ checked?: boolean; length?: number }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 20px;
  gap: 16px;
  cursor: pointer;
  width: ${(props) => (props.length == 1 ? '33%' : '100%')};
  height: 180px;

  background: #ffffff;
  border: ${(props) => (props.checked ? '1px solid #F43F5E' : '1px solid #B7C1CF')};
  box-shadow: ${(props) => (props.checked ? '0px 1px 2px 0px #0000000D' : 'none')};
  border-radius: 8px;
  flex: none;
  order: 0;
  flex-grow: 0;

  &:hover {
    border: 1px solid #fa5757;
  }
`;

const WalletDeployHeadline = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const WalletCheckmarkButton = styled.img<{ checked?: boolean }>`
  transition: 0.2s all linear;
  margin-left: auto;
  position: relative;
  cursor: pointer;
  width: 20px;
  height: 20px;
`;

const WalletDeployButtonTitle = styled.p`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 28px;
  display: flex;
  align-items: center;
  letter-spacing: 0.01em;
  color: #3d4148;
`;

const WalletDeployButtonDescription = styled.p`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  letter-spacing: 0.015em;
  color: #3d4148;
`;
