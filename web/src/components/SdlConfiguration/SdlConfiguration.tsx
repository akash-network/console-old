import React from 'react';
import {
  Accordion,
  accordionClasses,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Slide,
  Stack,
  Typography,
} from '@mui/material';
import { Field } from 'formik';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { capitalize } from 'lodash';
import { Pricing } from './Pricing';
import { Cpu } from './Cpu';
import { Memory } from './Memory';
import { Storage } from './Storage';
import { Ports } from './Ports';
import { EnvironmentVariable } from './EnvironmentVariable';
import { SdlEditor } from './SdllEditor';
import styled from '@emotion/styled';
import { Image } from './Image';
import { SdlConfigurationType } from './settings';
import { FieldWrapper, Input, Label, LabelTitle } from './styling';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import { HttpOptions } from './HttpOptions';
import { useRpcNode } from '../../hooks/useRpcNode';
import { Gpu } from './Gpu';

interface SdlConfigurationProps {
  actionItems?: () => React.ReactNode;
  sdl: any;
  reviewSdl: boolean;
  closeReviewModal: () => void;
  configurationType: SdlConfigurationType;
  progressVisible?: boolean;
  cardMessage?: string | undefined;
  onSave: (sdl: any) => void;
}

export const SdlConfiguration: React.FC<SdlConfigurationProps> = ({
  actionItems,
  sdl,
  reviewSdl,
  closeReviewModal,
  configurationType,
  progressVisible,
  cardMessage,
  onSave,
}) => {
  const [getRpcNode] = useRpcNode();
  const forbidEditing = configurationType === SdlConfigurationType.Update;
  const hasGPU = getRpcNode().networkType === 'testnet';

  // hide the GPU section for now
  const showGpu = false;

  return (
    <React.Fragment>
      {progressVisible && (
        <Box sx={{ minWidth: 600 }}>
          <Card>
            <CardContent
              style={{
                textAlign: 'center',
                marginTop: '100px',
                marginBottom: '100px',
              }}
            >
              <Slide direction="up" in={progressVisible} unmountOnExit>
                <Stack sx={{ width: '100%', color: 'grey.700' }} spacing={2}>
                  <Typography variant="h3">{cardMessage}</Typography>
                  <LinearProgress />
                </Stack>
              </Slide>
            </CardContent>
          </Card>
        </Box>
      )}
      {!progressVisible && (
        <SdlConfigurationWrapper>
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
              margin: '0 auto',
              width: '821px',
            }}
          >
            <DeploymentFormWrapper>
              <FieldWrapper>
                <Label htmlFor="appName">
                  <LabelTitle>Name Your App</LabelTitle>
                </Label>
                <Field name="appName" id="appName">
                  {({ field }: any) => (
                    <InputField
                      {...field}
                      className="mt-2"
                      disabled={forbidEditing}
                      placeholder="Optional. We will auto-generate one for you, if you don't provide a name."
                    />
                  )}
                </Field>
              </FieldWrapper>
            </DeploymentFormWrapper>

            <div>
              <ToolTipTitleWrapper>
                <ConfigurationTitle>Configure services</ConfigurationTitle>
                <Tooltip
                  title="This is where you can specify various parameters (one per service) that make up your SDL file. The number and name of the services will vary depending on the application/ SDL"
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
              </ToolTipTitleWrapper>
              {sdl.deployment &&
                Object.keys(sdl.deployment)?.map((serviceName, index) => {
                  const placement = Object.keys(sdl.deployment[serviceName])[0];
                  const profile = sdl.deployment[serviceName][placement].profile;
                  const { profiles, services } = sdl;

                  // Initialize the GPU resource if it doesn't exist
                  if (hasGPU && profiles.compute[profile]?.resources.gpu === undefined) {
                    profiles.compute[profile].resources.gpu = {
                      units: 0,
                    };
                  }

                  return (
                    <AppAccordion key={serviceName} className="p-2">
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{capitalize(serviceName)}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          style={{
                            gap: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <h1 className="font-medium ">Image</h1>
                          <Image currentProfile={serviceName} />

                          <ToolTipTitleWrapper>
                            <ConfigurationTitle>Pricing</ConfigurationTitle>
                            <Tooltip
                              title="The value you specify here is the maximum you would like to pay for the compute resources you are requesting for this service. uakt allows you to specify an amount that is a fraction of 1AKT"
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
                          </ToolTipTitleWrapper>
                          <Pricing
                            profiles={profiles}
                            currentProfile={profile}
                            placement={placement}
                            disabled={forbidEditing}
                          />

                          <ToolTipTitleWrapper>
                            <ConfigurationTitle>Resources</ConfigurationTitle>
                            <Tooltip
                              title="This is where you specify how much CPU, memory and storage you would like to lease from the provider, to host your application."
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
                          </ToolTipTitleWrapper>
                          <Cpu currentProfile={profile} disabled={forbidEditing} />
                          <Memory currentProfile={profile} disabled={forbidEditing} />
                          <Storage
                            serviceName={serviceName}
                            profiles={profiles}
                            currentProfile={profile}
                            disabled={forbidEditing}
                          />

                          {hasGPU && showGpu && <Gpu currentProfile={profile} disabled={forbidEditing} />}

                          <h1 className="font-medium">Ports</h1>
                          <Ports serviceName={serviceName} services={services} />

                          <h1 className="font-medium">Environment Variables</h1>
                          <EnvironmentVariable
                            serviceName={serviceName}
                            services={services}
                            disabled={forbidEditing}
                          />

                          <h1 className='font-medium'>HTTP Options</h1>
                          <HttpOptions
                            serviceName={serviceName}
                            services={services}
                            disabled={forbidEditing}
                          />

                        </div>
                        <SdlEditor
                          reviewSdl={reviewSdl}
                          closeReviewModal={closeReviewModal}
                          disabled={forbidEditing}
                          onSave={onSave} // Pass the onSave prop
                        />
                      </AccordionDetails>
                    </AppAccordion>
                  );
                })}
            </div>
            {actionItems && actionItems()}
          </Box>
        </SdlConfigurationWrapper>
      )}
    </React.Fragment>
  );
};

const SdlConfigurationWrapper = styled.div`
  gap: 20px;
  display: flex;
  flex-direction: column;
`;

const DeploymentFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 20px;

  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
`;

const InputField = styled(Input)`
  border: 1px solid #d7d7d7;
  width: 100%;

  &:disabled {
    background-color: #d7d7d73d;
    pointer-events: none;
  }
`;

const AppAccordion = styled(Accordion)`
  box-shadow: none;

  & .${accordionClasses.expanded} {
    border-bottom: none;
    background: #f9fafb;
  }

  & .${accordionClasses.region} {
    background: #f9fafb;
  }

  &:last-of-type {
    border-radius: 0 0 8px 8px;
  }

  &:before {
    background-color: initial;
  }
`;

const ConfigurationTitle = styled.h1`
  font-size: 17px;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
`;

const ToolTipTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: white;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
`;
