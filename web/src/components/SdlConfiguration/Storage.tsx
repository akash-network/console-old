import { Box, FormControl, IconButton, MenuItem, Select, Stack, Tab, Tabs, Tooltip } from '@mui/material';
import { Field, FieldArray } from 'formik';
import { MeasurementControl } from '../MeasurementControl';
import React from 'react';
import styled from '@emotion/styled';
import { SDLSpec } from './settings';
import {
  AddNewButton,
  AddNewButtonWrapper,
  FieldWrapper,
  Input,
  SdlSectionWrapper,
  VariableWrapper,
  TrashIcon,
  PlusSign,
  TableTitle,
} from './styling';
import { randomInt } from 'crypto';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const validateStorage = (value: string) => {
  const size = value.slice(0, -2);
  const intValue = parseInt(size, 10);

  if (isNaN(intValue) || intValue <= 0) {
    return 'Storage must be a positive value greater than zero';
  }
};

const validateStorageData = (value: string) => {
  if (value === '') {
    return 'This value can\'t be blank';
  }
};

type StorageProfile = {
  resources: {
    storage: Array<{
      name: string;
      attributes: string[];
    }>;
  };
};

type StorageProps = {
  serviceName: string;
  profiles: {
    compute: Record<string, StorageProfile>;
  };
  currentProfile: string;
  disabled?: boolean;
};

export const Storage: React.FC<StorageProps> = ({
  serviceName,
  profiles,
  currentProfile,
  disabled,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  // const withPersistentStorage = Array.isArray(profiles.compute[currentProfile]?.resources.storage);
  return (
    <SdlSectionWrapper>
      <StorageType>Storage Type</StorageType>
      <Tabs
        variant="fullWidth"
        value={value}
        onChange={handleChange}
        sx={{ marginBottom: '16px', borderBottom: '1px solid #D1D5DB' }}
      >
        <Tab sx={{ textTransform: 'none' }} label={'Ephemeral'} {...a11yProps(0)} />
        <Tab sx={{ textTransform: 'none' }} label={'Persistent'} {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <FieldArray
          name={`sdl.profiles.compute.${currentProfile}.resources.storage`}
          render={(arrayHelpers: any) => {
            const storages = profiles.compute[currentProfile]?.resources.storage;
            return (
              <>
                {storages?.map(
                  (storage, index) =>
                    !storage?.attributes && (
                      <FieldWrapper
                        key={`${currentProfile}-ephemeral-${index}`}
                        style={{
                          display: 'flex',
                          columnGap: '10px',
                          paddingBottom: '10px',
                        }}
                      >
                        <Field
                          name={`sdl.profiles.compute.${currentProfile}.resources.storage.${index}.size`}
                          validate={validateStorage}
                          id="disk"
                        >
                          {({ field, form, meta }: any) => (
                            <>
                              <MeasurementControl
                                error={meta?.error}
                                title="Disk"
                                subTitle="Disk Required"
                                setFieldValue={form.setFieldValue}
                                disabled={disabled}
                                smallIncrement
                                {...field}
                              />
                            </>
                          )}
                        </Field>
                        {!disabled && (
                          <Tooltip
                            title={
                              storages.length === 1 &&
                              index === 0 &&
                              'This is your only storage, you have to have at least one to be able to deploy the SDL'
                            }
                          >
                            <IconButton
                              sx={{
                                background: '#FFFFFF',
                                border: '1px solid #D1D5DB',
                                boxShadow: '0px 1px 2px rgb(0 0 0 / 5%)',
                                borderRadius: '6px',
                                width: '46px',
                              }}
                              onClick={() => {
                                // Remove selected ephemeral storage but only if it is not the only storage
                                // otherwise inform the user that deploy can't be successful and forbid delete
                                storages.length !== 1 && arrayHelpers.remove(index);
                              }}
                              aria-label="Delete storage"
                            >
                              <TrashIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </FieldWrapper>
                    )
                )}
                {!disabled && (
                  <AddNewButtonWrapper>
                    <AddNewButton
                      startIcon={<PlusSign />}
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        arrayHelpers.insert(
                          profiles.compute[currentProfile]?.resources.storage?.length + 1 ?? 0,
                          {
                            size: '512Mi',
                          }
                        )
                      }
                    >
                      Add New Ephemeral Storage
                    </AddNewButton>
                  </AddNewButtonWrapper>
                )}
              </>
            );
          }}
        />
      </TabPanel>

      {/* Persistent storage */}
      <TabPanel value={value} index={1}>
        <Stack spacing={2} direction="row" marginBottom={1}>
          <TableTitle width={163}>Name</TableTitle>
          <TableTitle width={163}>Mount</TableTitle>
          <TableTitle width={163}>Size</TableTitle>
          <TableTitle width={'auto'}>Type</TableTitle>
        </Stack>
        <FieldArray
          name={`sdl.profiles.compute.${currentProfile}.resources.storage`}
          render={(arrayHelpers: any) => (
            <React.Fragment>
              {profiles.compute[currentProfile]?.resources.storage?.map((storage, index) => {
                return (
                  storage?.attributes && (
                    <FieldWrapper
                      key={`${currentProfile}-persistent-${index}`}
                      style={{
                        display: 'flex',
                        columnGap: '10px',
                        paddingBottom: '10px',
                      }}
                    >
                      <Field
                        name={`sdl.profiles.compute.${currentProfile}.resources.storage.${index}.name`}
                        validate={validateStorageData}
                      >
                        {({ field, meta }: any) => (
                          <InputField {...field} disabled={disabled} error={meta?.error} />
                        )}
                      </Field>
                      <Field
                        name={`sdl.services.${serviceName}.params.storage.${storage.name}.mount`}
                        validate={validateStorageData}
                      >
                        {({ field, meta }: any) => (
                          <InputField {...field} disabled={disabled} error={meta?.error} />
                        )}
                      </Field>
                      <Field
                        name={`sdl.profiles.compute.${currentProfile}.resources.storage.${index}.size`}
                        validate={validateStorageData}
                      >
                        {({ field, meta }: any) => (
                          <InputField {...field} disabled={disabled} error={meta?.error} />
                        )}
                      </Field>
                      <Field
                        name={`sdl.profiles.compute.${currentProfile}.resources.storage.${index}.attributes.class`}
                      >
                        {({ field }: any) => (
                          <FormControl
                            fullWidth
                            style={{
                              background: 'white',
                              ...(disabled && {
                                backgroundColor: '#d7d7d73d',
                                pointerEvents: 'none',
                              }),
                            }}
                          >
                            <Select
                              labelId="to-id"
                              {...field}
                              SelectDisplayProps={{
                                style: {
                                  padding: '11.5px 14px',
                                },
                              }}
                            >
                              <MenuItem value="beta1">
                                <span>HDD</span>
                              </MenuItem>
                              <MenuItem value="beta2">
                                <span>SSD</span>
                              </MenuItem>
                              <MenuItem value="beta3">
                                <span>NVMe</span>
                              </MenuItem>
                            </Select>
                          </FormControl>
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
                          onClick={() => {
                            // Here we have to update parent sdl.services form and manipulate with service data bound to this persistent storage
                            const sdl = arrayHelpers.form.values.sdl as SDLSpec;
                            const storageParams = sdl.services[serviceName]?.params?.storage;

                            if (storageParams) {
                              const storages = Object.keys(storageParams);

                              // Remove the storage from service params
                              for (const key of Object.keys(storageParams)) {
                                if (key === storage?.name && storageParams[key]) {
                                  delete storageParams[key];
                                  break;
                                }
                              }

                              // -1 because we delete key after this loop
                              if (storages.length - 1 === 0) {
                                delete sdl.services[serviceName].params;
                              }
                            }

                            // Here we update the sdl in Formik state to propagate it down to all children
                            arrayHelpers.form.setFieldValue('sdl', sdl);
                            // Remove selected persistent storage
                            arrayHelpers.remove(index);
                          }}
                          aria-label="Delete storage"
                        >
                          <TrashIcon />
                        </IconButton>
                      )}
                    </FieldWrapper>
                  )
                );
              })}
              {!disabled && (
                <AddNewButtonWrapper>
                  <AddNewButton
                    startIcon={<PlusSign />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const sdl = arrayHelpers.form.values.sdl as SDLSpec;

                      if (sdl.services[serviceName]?.params?.storage === undefined) {
                        sdl.services[serviceName].params = {
                          storage: {},
                        };
                      }

                      arrayHelpers.insert(
                        profiles.compute[currentProfile]?.resources.storage?.length + 1 ?? 0,
                        {
                          size: '1Gi',
                          name: '',
                          attributes: {
                            persistent: true,
                            class: 'beta1',
                          },
                        }
                      );
                    }}
                  >
                    Add New Persistent Storage
                  </AddNewButton>
                </AddNewButtonWrapper>
              )}
            </React.Fragment>
          )}
        />
      </TabPanel>
    </SdlSectionWrapper>
  );
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const InputField = styled(Input) <{ error?: boolean }>`
  width: 100%;

  &:disabled {
    background-color: #d7d7d73d;
    pointer-events: none;
  }
`;

const StorageType = styled.p`
  font-family: 'Satoshi-Regular', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
`;