import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Button } from "@mui/material";

export const FieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input<{ error?: boolean }>`
  padding: 10px 16px;
  gap: 8px;
  border: 1px solid ${(props: { error?: boolean }) => props?.error ? "red" : "#D7D7D7"};
  border-radius: 6px;
  font-weight: 500;
  
  &:focus, &:hover {
    border-color: #FA5757;
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
  ${p => p.updatePage && `
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
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #D7D7D7;
  border-radius: 6px;

  &:hover {
    border-color: #3D4148
  }
`;

export const AddNewButton = styled(Button)`
  ${ButtonTemplate};
  border-radius: 8px;
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 14px;
  box-shadow: 0px 1px 2px 0px #0000000D;

  &:hover {
    background-color: #F4F5F8
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
  color: #3D4148;
  padding-right: 10px;
`;

export const SdlSectionWrapper = styled.div`
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
  border-radius: 6px;
  padding: 20px;
`;
