import { InputNumber } from './InputNumbers';
import React from 'react';
import styled from '@emotion/styled';

interface MeasurementControlProps {
  title: string;
  subTitle?: string;
  setFieldValue: (name: string, value: string | number) => void;
  disabled: boolean;
  children: Array<React.ReactNode>;

  [key: string]: any;
}

export const MeasurementControl: React.FC<MeasurementControlProps> = ({
  title,
  subTitle,
  setFieldValue,
  disabled,
  children,
  ...field
}) => {
  return (
    <MeasurementWrapper disabled={disabled} error={field?.error}>
      <div className="flex flex-col">
        <MeasurementTitle>{title}</MeasurementTitle>
        <MeasurementSubTitle>{subTitle}</MeasurementSubTitle>
      </div>
      <InputNumber setFieldValue={setFieldValue} disabled={disabled} {...field} />
      {children}
    </MeasurementWrapper>
  );
};

const MeasurementWrapper = styled.div<{ disabled?: boolean; error?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 17px 25px;
  gap: 8px;

  width: 100%;
  height: 74px;
  background-color: ${(p) => (p.disabled ? '#d7d7d73d' : '#FFFFFF')};

  border: 1px solid ${(props) => (props?.error ? 'red' : '#D1D5DB')};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
`;

const MeasurementTitle = styled.p`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
`;
const MeasurementSubTitle = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
`;
