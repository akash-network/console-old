import { Field } from 'formik';
import { ErrorMessageComponent } from '../ErrorMessage';
import React from 'react';
import styled from '@emotion/styled';
import { FieldWrapper, Input } from './styling';

const validatePricing = (value: any) => {
  let error;
  if (value <= 0) {
    error = 'Pricing can"t be 0, you have to add positive number only';
  }
  return error;
};

type PricingAmount = {
  amount: number;
  denom: string;
};

type PricingPlacement = {
  pricing: Record<string, PricingAmount>;
};

type PricingProfile = {
  placement: Record<string, PricingPlacement>;
};

type PricingProps = {
  profiles: PricingProfile;
  placement: string;
  currentProfile: string;
  disabled: boolean;
};

export const Pricing: React.FC<PricingProps> = ({
  profiles,
  placement,
  currentProfile,
  disabled,
}) => {
  return (
    <Field
      name={`sdl.profiles.placement.${placement}.pricing.${currentProfile}.amount`}
      validate={validatePricing}
      id="amount"
    >
      {({ field, meta }: any) => (
        <React.Fragment>
          <FieldWrapperAmountCurrency>
            <FieldAmountCurrency>
              {profiles?.placement[placement]?.pricing[currentProfile].denom}
            </FieldAmountCurrency>
            <InputField
              error={meta?.error}
              style={{
                borderStartStartRadius: 0,
                borderEndStartRadius: 0,
              }}
              type="number"
              disabled={disabled}
              {...field}
            />
          </FieldWrapperAmountCurrency>
          {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
        </React.Fragment>
      )}
    </Field>
  );
};

const FieldWrapperAmountCurrency = styled(FieldWrapper)`
  display: flex;
  align-items: center;
`;

const FieldAmountCurrency = styled.div`
  padding: 10px 16px;
  border: 1px solid #d7d7d7;
  border-radius: 6px;
  border-right: none;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  background: #f9fafb;
`;

const InputField = styled(Input)<{ error?: boolean }>`
  width: 100%;

  &:disabled {
    background-color: #d7d7d73d;
    pointer-events: none;
  }
`;
