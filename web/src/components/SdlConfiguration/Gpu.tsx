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

  const getModels = (attributes: GpuAttributes, vendor: string) => {
    if (vendor !== 'nvidia' && vendor !== 'amd' && vendor !== 'intel') {
      return new Set();
    }

    return new Set(attributes?.vendor[vendor]?.models);
  };

  const updateAttributeModels = (attributes: GpuAttributes, vendor: string, models: Set<string>) => {
    return null;
  };

  const addGpuFilter = (model: string, vendor: string) => {
    attributes.vendor[vendor].models = [...attributes.vendor[vendor].models, model];
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes`, attributes);
  };

  const removeGpuFilter = (model: string, vendor: string) => {
    attributes.vendor[vendor].models = attributes.vendor[vendor].models.filter((m: string) => m !== model);
    setFieldValue(`sdl.profiles.compute.${currentProfile}.resources.gpu.attributes`, attributes);
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
