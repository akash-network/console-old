import React, { useCallback } from 'react';
import { Field, useFormikContext } from 'formik';
import { MeasurementControl } from '../MeasurementControl';
import { ErrorMessageComponent } from '../ErrorMessage';
import { FieldWrapper } from './styling';

type VendorKey = 'nvidia' | 'amd' | 'intel';
const GPU_VENDORS: Array<VendorKey> = ['nvidia', 'amd', 'intel'];

type GpuProps = {
  currentProfile: string;
  disabled: boolean;
};

export const Gpu: React.FC<GpuProps> = ({ currentProfile, disabled }) => {
  const { setFieldValue, values } = useFormikContext();

  const handleSetUnits = useCallback((name: string, units: string) => {
    const unitsAsInt = parseInt(units);
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.units`, unitsAsInt);
  }, [currentProfile, setFieldValue]);

  const handleSetAttributes = useCallback((name: string, attributes: string) => {
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes`, attributes);
  }, [currentProfile, setFieldValue]);

  return (
    <FieldWrapper>
      <Field
        name={`sdl.profiles.compute.${currentProfile}.resources.gpu.units`}
        defaultValue={0}
        id="gpu"
      >
        {({ field, form, meta }: any) => (
          <React.Fragment>
            <MeasurementControl
              error={meta?.error}
              title="GPU"
              subTitle="GPUs Required"
              setFieldValue={handleSetUnits}
              type="number"
              withOutSuffix
              disabled={disabled}
              {...field}
            >
              <Field
                name={`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes`}
                id="gpu-attributes"
              >
                {({ field, form, meta }: any) => (
                  <MeasurementControl
                    error={meta?.error}
                    title="GPU Attributes"
                    subTitle="GPU Attributes"
                    setFieldValue={handleSetAttributes}
                    type="text"
                    disabled={disabled}
                    {...field}
                  />
                )}
              </Field>
              {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
            </MeasurementControl>
          </React.Fragment>
        )}
      </Field>
    </FieldWrapper>
  );
};
