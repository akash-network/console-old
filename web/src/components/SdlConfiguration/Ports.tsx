import React from 'react';
import { Field, FieldArray } from 'formik';
import styled from '@emotion/styled';
import { FormControl, IconButton, MenuItem, Select, Stack } from '@mui/material';
import { ErrorMessageComponent } from '../ErrorMessage';
import PlusIcon from '../../assets/images/plus-icon.svg';
import Trash from '../../assets/images/icon-trash.svg';
import {
  AddNewButton,
  AddNewButtonWrapper,
  FieldWrapper,
  Input,
  SdlSectionWrapper,
  TableTitle,
  VariableWrapper,
} from './styling';

const PlusSign = () => <img src={PlusIcon} alt="Plus Icon" />;
const TrashIcon = () => <img src={Trash} alt="Trash Icon" />;

const validatePort = (value: number, field: string) => {
  let error;
  if (value <= 0) {
    error = `${field.toUpperCase()} can"t be 0, you have to add positive number only`;
  }
  return error;
};

type Service = {
  expose: Array<{
    to: Array<{
      global: boolean;
    }>;
  }>;
};

type PortsProps = {
  serviceName: string;
  services: Record<string, Service>;
  updatePage?: boolean;
};

export const Ports: React.FC<PortsProps> = ({ serviceName, services, updatePage = false }) => {
  return (
    <FieldArray
      name={`sdl.services.${serviceName}.expose`}
      render={(arrayHelpers: any) => (
        <SdlSectionWrapper>
          <Stack direction="row" columnGap="10px">
            <TableTitle width={178}>Port</TableTitle>
            <TableTitle width={178}>As</TableTitle>
            <TableTitle width={178}>Host</TableTitle>
            <TableTitle width={'auto'}>Accept</TableTitle>
          </Stack>
          {services[serviceName]?.expose?.map((port, index) => (
            <VariableWrapper updatePage={updatePage} key={index}>
              <FieldWrapper>
                <Field
                  name={`sdl.services.${serviceName}.expose.${index}.port`}
                  validate={(value: number) => validatePort(value, 'port')}
                >
                  {({ field, meta }: any) => (
                    <React.Fragment>
                      <Input type="number" {...field} error={meta?.error} />
                      {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
                    </React.Fragment>
                  )}
                </Field>
              </FieldWrapper>
              <FieldWrapper>
                <Field
                  name={`sdl.services.${serviceName}.expose.${index}.as`}
                  validate={(value: number) => validatePort(value, 'as')}
                >
                  {({ field, meta }: any) => (
                    <React.Fragment>
                      <Input type="number" {...field} error={meta?.error} />
                      {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
                    </React.Fragment>
                  )}
                </Field>
              </FieldWrapper>

              <FieldWrapper>
                <Field name={`sdl.services.${serviceName}.expose.${index}.accept.[0]`}>
                  {({ field }: any) => <Input {...field} value={field.value ?? ''} />}
                </Field>
              </FieldWrapper>

              <FieldWrapper>
                <HostFiledWithButton>
                  {services[serviceName].expose[index].to?.map((expose, i) => {
                    return (
                      expose?.global && (
                        <FieldWrapper key={`sdl.services.${serviceName}`}>
                          <Field
                            name={`sdl.services.${serviceName}.expose.${index}.to.${i}.global`}
                          >
                            {({ field }: any) => (
                              <FormControl fullWidth style={{ background: 'white' }}>
                                <Select
                                  labelId="to-id"
                                  {...field}
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        '& .MuiList-root': {
                                          padding: '4px',
                                        },
                                      },
                                    },
                                  }}
                                  SelectDisplayProps={{
                                    style: {
                                      padding: '11.5px 14px',
                                    },
                                  }}
                                >
                                  <MenuItem value="true">
                                    <span>true</span>
                                  </MenuItem>
                                  <MenuItem value="false">
                                    <span>false</span>
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Field>
                        </FieldWrapper>
                      )
                    );
                  })}

                  <IconButton
                    sx={{
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      boxShadow: '0px 1px 2px rgb(0 0 0 / 5%)',
                      borderRadius: '6px',
                      width: '46px',
                      height: '46px',
                    }}
                    onClick={() => arrayHelpers.remove(index)}
                    aria-label="Delete port"
                  >
                    <TrashIcon />
                  </IconButton>
                </HostFiledWithButton>
              </FieldWrapper>
            </VariableWrapper>
          ))}
          <AddNewButtonWrapper>
            <AddNewButton
              startIcon={<PlusSign />}
              variant="outlined"
              size="small"
              onClick={() =>
                arrayHelpers.insert(services[serviceName]?.expose?.length + 1 ?? 0, {
                  port: 3000,
                  as: 80,
                  to: [{ global: true }],
                })
              }
            >
              Add New Port
            </AddNewButton>
          </AddNewButtonWrapper>
        </SdlSectionWrapper>
      )}
    />
  );
};

const HostFiledWithButton = styled.div`
  display: flex;
  column-gap: 10px;
`;