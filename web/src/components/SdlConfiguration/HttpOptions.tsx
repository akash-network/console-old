import { Field, FieldArray } from 'formik';
import { Stack, Grid } from '@mui/material';
import React from 'react';
import styled from '@emotion/styled';
import {
  Input,
  SdlSectionWrapper,
} from './styling';

import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

type NextCaseValues = 'error' | 'timeout' | '403' | '404' | '429' | '500' | '502' | '503' | '504' | 'off';

type HttpOptionsValues = {
  max_body_size?: number;
  read_timeout?: number;
  send_timeout?: number;
  next_cases?: Array<NextCaseValues>;
  next_tries?: number;
  next_timeout?: number;
};

type Service = {
  expose: {
    http_options?: HttpOptionsValues;
  }
};

type EnvironmentVariableProps = {
  serviceName: string;
  services: Record<string, Service>;
  disabled: boolean;
};

const httpOptions: Array<
  [keyof HttpOptionsValues, string, string, HttpOptionsValues[keyof HttpOptionsValues]]
> = [
    [
      'max_body_size',
      'Max Body Size',
      'Sets the maximum size of an individual HTTP request body',
      1048576,
    ],
    [
      'read_timeout',
      'Read Timeout',
      'Duration the proxy will wait for a response from the service',
      60000,
    ],
    [
      'send_timeout',
      'Send Timeout',
      'Duration the proxy will wait for the service to accept a request',
      60000,
    ],
    [
      'next_tries',
      'Next Tries',
      'Number of attempts the proxy will attempt another replica',
      3,
    ],
    [
      'next_timeout',
      'Next Timeout',
      'Duration the proxy will wait for a response from the service',
      0,
    ],
    // TODO: needs a special component for next cases since it's not a simple string or number.
    // [
    //   'next_cases',
    //   'Next Cases',
    //   'Defines the cases where the proxy will try another replica in the service.  Reference the upcoming “Next Cases Attribute Usage” section for details pertaining to allowed values.',
    //   ['error', 'timeout']
    // ],
  ];


export const HttpOptions: React.FC<EnvironmentVariableProps> = ({
  serviceName,
  disabled,
}) => {

  return (
    <FieldArray
      name={`sdl.services.${serviceName}.expose`}
      render={() => (
        <SdlSectionWrapper>
          <Stack gap="10px" direction={'column'}>
            {httpOptions.map(([key, label, description, defaultValue]) => (
              <Grid container key={key}>
                {/* label */}
                <Grid item xs={6}>
                  <label htmlFor={key}>{label}</label>
                  <Tooltip
                    title={description}
                    placement="right"
                    sx={{
                      fontSize: '25px',
                      color: 'rgb(207, 205, 204)',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                  >
                    <InfoIcon />
                  </Tooltip>
                </Grid>

                {/* input */}
                <Grid item xs={6}>
                  <Field
                    name={`sdl.services.${serviceName}.expose[0].http_options.${key}`}
                    id={`sdl.services.${serviceName}.expose[0].http_options.${key}`}
                    type="number"
                    placeholder={defaultValue?.toString()}
                    as={InputField}
                    disabled={disabled}
                  />
                </Grid>
              </Grid>
            ))}
          </Stack>
        </SdlSectionWrapper>
      )}
    />
  );
};

const InputField = styled(Input)`
    width: 100%;

    &:disabled {
      background - color: #d7d7d73d;
    pointer-events: none;
  }`;
