import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Box, Button } from '@mui/material';

import PlusIcon from '../../assets/images/plus-icon.svg';
import Trash from '../../assets/images/icon-trash.svg';

// TODO: This should be integrated with the general icons
export const PlusSign = () => <img src={PlusIcon} alt="Plus Icon" />;
export const TrashIcon = () => <img src={Trash} alt="Trash Icon" />;

export const FieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input<{ error?: boolean }>`
  padding: 10px 16px;
  gap: 8px;
  border: 1px solid ${(props: { error?: boolean }) => (props?.error ? 'red' : '#D7D7D7')};
  border-radius: 6px;
  font-weight: 500;

  &:focus,
  &:hover {
    border-color: #fa5757;
    outline: 0 none;
  }

  &::selection {
    background-color: rgba(250, 87, 87, 0.08);
  }
`;

export const VariableWrapper = styled.div<{ updatePage?: boolean }>`
  display: flex;
  align-items: center;
  column-gap: 10px;
  padding: 5px 0;
  width: 100%;
  ${(p) =>
    p.updatePage &&
    `
    gap: 20px;
    display: flex;
    flex-direction: column;
  `}
`;

export const AddNewButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: start;
  margin-top: 16px;
`;

export const ButtonTemplate = css`
  padding: 10px 32px;
  gap: 8px;
  color: #374151;
  text-transform: capitalize;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #d7d7d7;
  border-radius: 6px;

  &:hover {
    border-color: #3d4148;
  }
`;

export const AddNewButton = styled(Button)`
  ${ButtonTemplate};
  border-radius: 8px;
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 14px;
  box-shadow: 0px 1px 2px 0px #0000000d;

  &:hover {
    background-color: #f4f5f8;
  }
`;

export const Label = styled.label`
  position: relative;
  padding-left: 5px;
`;

export const LabelTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #3d4148;
  padding-right: 10px;
`;

export const SdlSectionWrapper = styled.div`
  background: #ffffff;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
  border-radius: 6px;
  padding: 20px;
`;

export const TableTitle = styled(Box)`
  font-weight: 500;
  font-size: 14px;
  color: #3d4148;
  box-sizing: border-box;
`;
