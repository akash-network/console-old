import React from 'react';
import styled from '@emotion/styled';
import IconTop from '../../assets/images/icon-top.svg';
import IconDown from '../../assets/images/icon-down.svg';

const ButtonUp = ({ onClick }: any) => (
  <img style={{ height: 8, cursor: 'pointer' }} onClick={onClick} src={IconTop} alt="Icon Up" />
);

const ButtonDown = ({ onClick }: any) => (
  <img style={{ height: 8, cursor: 'pointer' }} onClick={onClick} src={IconDown} alt="Icon Down" />
);

interface InputNumberProps {
  setFieldValue: (name: string, value: string | number) => void;
  disabled: boolean;

  [key: string]: any;
}

export const InputNumber: React.FC<InputNumberProps> = ({ setFieldValue, disabled, ...field }) => {
  const size = {
    value:
      typeof field.value === 'string'
        ? Number(field.withOutSuffix ? field.value : field.value.slice(0, -2))
        : parseFloat(field.value),
    suffix: !field.withOutSuffix && typeof field.value === 'string' && field.value.slice(-2),
  };

  return (
    <NumberInputWrapper>
      <InputWithSuffix>
        <NumberInput
          min="0"
          step="0.1"
          // disabled
          type="number"
          value={size.value}
          onChange={({ currentTarget }) => {
            setFieldValue(field.name, currentTarget.value + (size?.suffix || ''));
          }}
        />
        {size?.suffix && <InputSuffix>{size.suffix}</InputSuffix>}
      </InputWithSuffix>
      {!disabled && (
        <NumberButtonWrapper>
          <InputIconUp
            onClick={() => {
              const isNumberAnExponent = field.withPowerOfTwo;
              const isNumberWithSmallStep = field.smallIncrement;
              if (isNumberAnExponent) {
                const exponent = Math.log2(size.value);
                return setFieldValue(field.name, Math.pow(2, exponent + 1) + (size.suffix || ''));
              }
              if (isNumberWithSmallStep && (size.suffix === 'Gi' || field?.withOutSuffix)) {
                return setFieldValue(
                  field.name,
                  +(size.value + 0.1).toFixed(1) + (size.suffix || '')
                );
              }
              setFieldValue(field.name, size.value + 1 + (size.suffix || ''));
            }}
          />
          <InputIconDown
            onClick={() => {
              const isNumberAnExponent = field.withPowerOfTwo;
              const isNumberWithSmallStep = field.smallIncrement;
              if (isNumberAnExponent) {
                const exponent = Math.log2(size.value);
                return setFieldValue(
                  field.name,
                  Math.pow(2, exponent - 1 >= 0 ? exponent - 1 : exponent) + (size.suffix || '')
                );
              }
              if (isNumberWithSmallStep && (size.suffix === 'Gi' || field?.withOutSuffix)) {
                return setFieldValue(
                  field.name,
                  +(size.value - 0.1).toFixed(1) + (size.suffix || '')
                );
              }
              setFieldValue(
                field.name,
                (size.value - 1 >= 0 ? size.value - 1 : size.value) + (size?.suffix || '')
              );
            }}
          />
        </NumberButtonWrapper>
      )}
    </NumberInputWrapper>
  );
};

const NumberInputWrapper = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  position: relative;
  margin-left: auto;
`;

const InputWithSuffix = styled.div`
  display: flex;
  border-right: 1px solid #d1d5db;
  padding: 0.5rem;
`;
const InputSuffix = styled.span``;

const NumberInput = styled.input`
  appearance: textfield;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  outline: none;
  box-sizing: content-box;
  background: none;
  display: block;
  min-width: 0;
  width: 40px;

  &:after {
    content: 'Gb';
    position: relative;
    width: 20px;
    height: 20px;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
  }
`;

const NumberButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0 8px;
  height: 2.5rem;
`;

const InputIconUp = styled(ButtonUp)`
  width: 1rem;
  height: 1rem;
`;

const InputIconDown = styled(ButtonDown)`
  width: 1rem;
  height: 1rem;
`;
