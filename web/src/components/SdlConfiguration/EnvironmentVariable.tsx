import { Field, FieldArray } from 'formik';
import { IconButton } from '@mui/material';
import React from 'react';
import PlusIcon from '../../assets/images/plus-icon.svg';
import Trash from '../../assets/images/icon-trash.svg';
import styled from '@emotion/styled';
import {
  AddNewButton,
  AddNewButtonWrapper,
  Input,
  SdlSectionWrapper,
  VariableWrapper,
} from './styling';

const PlusSign = () => <img src={PlusIcon} alt="Plus Icon" />;
const TrashIcon = () => <img src={Trash} alt="Trash Icon" />;

type Service = {
  env: Array<string>;
};

type EnvironmentVariableProps = {
  serviceName: string;
  services: Record<string, Service>;
  disabled: boolean;
};

export const EnvironmentVariable: React.FC<EnvironmentVariableProps> = ({
  serviceName,
  services,
  disabled,
}) => {
  return (
    <FieldArray
      name={`sdl.services.${serviceName}.env`}
      render={(arrayHelpers: any) => (
        <SdlSectionWrapper>
          {services[serviceName]?.env?.map((env, index) => (
            <VariableWrapper key={index}>
              <Field name={`sdl.services.${serviceName}.env.${index}`}>
                {({ field }: { field: { value: string } }) => (
                  <React.Fragment>
                    <InputField
                      disabled={disabled}
                      value={field.value.split('=')[0]}
                      onChange={({ currentTarget }) => {
                        return arrayHelpers.replace(index, `${currentTarget.value}=`);
                      }}
                    />
                  </React.Fragment>
                )}
              </Field>
              <Field name={`sdl.services.${serviceName}.env.${index}`}>
                {({ field }: { field: { value: string } }) => (
                  <InputField
                    disabled={disabled}
                    value={field.value.split('=')[1]}
                    onChange={({ currentTarget }) => {
                      const name = field.value.split('=')[0];
                      const value = currentTarget.value;
                      return arrayHelpers.replace(index, `${name}=${value}`);
                    }}
                  />
                )}
              </Field>
              {!disabled && (
                <IconButton
                  sx={{
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    boxShadow: '0px 1px 2px rgb(0 0 0 / 5%)',
                    borderRadius: '6px',
                    width: '46px',
                  }}
                  onClick={() => arrayHelpers.remove(index)}
                  aria-label="Delete environment variable"
                >
                  <TrashIcon />
                </IconButton>
              )}
            </VariableWrapper>
          ))}
          {!disabled && (
            <AddNewButtonWrapper>
              <AddNewButton
                startIcon={<PlusSign />}
                variant="outlined"
                size="small"
                onClick={() => arrayHelpers.insert(services[serviceName]?.env?.length + 1 ?? 0, '')}
              >
                Add New Variable
              </AddNewButton>
            </AddNewButtonWrapper>
          )}
        </SdlSectionWrapper>
      )}
    />
  );
};

const InputField = styled(Input)`
  width: 100%;
  &:disabled {
    background-color: #d7d7d73d;
    pointer-events: none;
  }
`;
