import React, { useCallback } from 'react';
import { Field, useFormikContext } from 'formik';
import { MeasurementControl } from '../MeasurementControl';
import { FieldWrapper, Label, SdlSectionWrapper } from './styling';
import { Box, Stack, Typography, Checkbox } from '@mui/material';
import { useQuery } from 'react-query';
import { queryProviderGpus } from '../../api/queries';
import Loading from '../Loading';

type GpuVendor = 'nvidia' | 'amd' | 'intel';

type GpuAttributes = {
  vendor: {
    [key in GpuVendor]?: {
      models: Array<string>;
    }
  }
}

type GpuUnitProps = {
  currentProfile: string;
  disabled: boolean;
};

const GpuUnits: React.FC<GpuUnitProps> = ({ currentProfile, disabled }) => {
  const { setFieldValue, values } = useFormikContext<any>();

  const handleSetUnits = useCallback((name: string, units: string) => {
    const unitsAsInt = parseInt(units);
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.units`, unitsAsInt);
  }, [currentProfile, setFieldValue]);

  return (
    <FieldWrapper>
      <Field
        name={`sdl.profiles.compute.${currentProfile}.resources.gpu.units`}
        defaultValue={values.sdl.profiles.compute[currentProfile].resources.gpu.units || 0}
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
            </MeasurementControl>
          </React.Fragment>
        )}
      </Field>
    </FieldWrapper>
  );
};

type GpuAttributesProps = {
  currentProfile: string;
  disabled: boolean;
}

// tag based component for selecting which gpus to allow.
const GpuAttributes: React.FC<GpuAttributesProps> = ({ currentProfile, disabled }) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const attributes = values.sdl.profiles.compute[currentProfile].resources.gpu.attributes || {};
  const { data: gpus, isLoading: loadingGpus } = useQuery(['gpus', 'all'], queryProviderGpus);

  const addGpuFilter = (model: string, vendor: string) => {
    const vendorModels: Array<{ model: string }> = attributes?.vendor[vendor] || [];
    const modelSet = new Set(vendorModels.map((m) => `${m.model}`));

    modelSet.add(model);

    const updatedModels = Array.from(modelSet).map((m) => ({ model: m }));
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes.vendor.${vendor}`, updatedModels);
  };

  const removeGpuVendor = (model: string, vendor: string) => {
    const vendorSet = new Set(Object.keys(attributes.vendor));

    vendorSet.delete(vendor);

    if (vendorSet.size === 0) {
      setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu`, undefined);
    } else {
      const updatedVendors = Array.from(vendorSet).map((v) => ({ [v]: attributes.vendor[v] }));
      setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes.vendor`, updatedVendors);
    }
  };

  const removeGpuFilter = (model: string, vendor: string) => {
    const vendorModels: Array<{ model: string }> = attributes?.vendor[vendor] || [];
    const modelSet = new Set(vendorModels.map((m) => `${m.model}`));

    modelSet.delete(model);

    if (modelSet.size === 0) {
      removeGpuVendor(model, vendor);
    } else {
      const updatedModels = Array.from(modelSet).map((m) => ({ model: m }));
      setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes.vendor.${vendor}`, updatedModels);
    }
  };

  const handleGpuClick = (vendor: string, model: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        addGpuFilter(model, vendor);
      } else {
        removeGpuFilter(model, vendor);
      }
    };
  };

  if (loadingGpus || gpus === undefined || typeof gpus.entries !== 'function') {
    return <Loading msg="Querying available GPUs" />;
  }

  return (
    <FieldWrapper>
      <Typography variant="body2" color="text.secondary" marginTop={2}>
        Select the GPU vendors/models that you'd like to use for your deployment.
      </Typography>
      <Stack gap={1} direction="row">
        {[...gpus.entries()].map(([entry], index) => (
          <Box key={index}>
            <Checkbox onChange={handleGpuClick(entry.vendor, entry.model)} />
            <Label htmlFor={entry.vendor}>{entry.vendor} {entry.model}</Label>
          </Box>
        ))}
      </Stack>
    </FieldWrapper >
  );
};

type GpuProps = {
  currentProfile: string;
  disabled: boolean;
};

export const Gpu: React.FC<GpuProps> = (props) => {
  const { currentProfile, disabled } = props;
  const { values } = useFormikContext<any>();

  return (
    <SdlSectionWrapper>
      <Typography variant="h4">
        GPUs
      </Typography>
      <Stack>
        <GpuUnits currentProfile={currentProfile} disabled={disabled} />
        {values.sdl.profiles.compute[currentProfile].resources.gpu.units > 0 && (
          <GpuAttributes currentProfile={currentProfile} disabled={disabled} />
        )}
      </Stack>
    </SdlSectionWrapper>
  );
};
