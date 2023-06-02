import React from 'react';
import { Field } from 'formik';
import { MeasurementControl } from '../MeasurementControl';
import { ErrorMessageComponent } from '../ErrorMessage';
import { FieldWrapper } from './styling';

const validateCpu = (value: number) => {
  let error;
  if (value <= 0) {
    error = 'CPU can"t be 0 and lower, you have to add positive number only';
  }
  return error;
};

type CpuProps = {
  currentProfile: string;
  disabled: boolean;
};

export const Cpu: React.FC<CpuProps> = ({ currentProfile, disabled }) => {
  return (
    <FieldWrapper>
      <Field
        name={`sdl.profiles.compute.${currentProfile}.resources.cpu.units`}
        validate={validateCpu}
        id="cpu"
      >
        {({ field, form, meta }: any) => (
          <React.Fragment>
            <MeasurementControl
              error={meta?.error}
              title="CPU"
              subTitle="CPU Required"
              setFieldValue={form.setFieldValue}
              withOutSuffix
              smallIncrement
              disabled={disabled}
              {...field}
            />
            {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
          </React.Fragment>
        )}
      </Field>
    </FieldWrapper>
  );
};
