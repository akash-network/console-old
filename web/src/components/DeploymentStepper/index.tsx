import React, { Suspense, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Slide,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import {
  deploymentDataStale,
  deploymentSdl,
  keplrState,
  myDeployments as myDeploymentsAtom,
} from '../../recoil/atoms';
import { Dialog } from '../Dialog';
import FeaturedApps from '../../pages/FeaturedApps';
import SelectApp from '../../pages/SelectApp';
import SelectProvider from '../../pages/SelectProvider';
import { ConfigureApp } from '../../pages/ConfigureApp';
import { PreflightCheck } from '../../pages/PreflightCheck';
import { nameToURI, uriToName } from '../../_helpers/param-helpers';
import { initialValues, InitialValuesProps, SDLSpec } from '../SdlConfiguration/settings';
import { myDeploymentFormat } from '../../_helpers/my-deployment-utils';
import logging from '../../logging';
import Loading from '../Loading';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { useMutation } from 'react-query';
import { createDeployment, createLease, sendManifest } from '../../api/mutations';
import { getRpcNode } from '../../hooks/useRpcNode';

const steps = ['Featured Apps', 'Select', 'Configure', 'Review', 'Deploy'];

export interface DeploymentStepperProps {
  dseq?: string;
  leaseId?: string;
}

const DeploymentStepper: React.FC<DeploymentStepperProps> = () => {
  const keplr = useRecoilValue(keplrState);
  const navigate = useNavigate();
  const [deploymentId, setDeploymentId] = React.useState<{ owner: string; dseq: string }>();
  const { folderName, templateId, intentId, dseq } = useParams();
  const [sdl, setSdl] = useRecoilState(deploymentSdl);
  const [cardMessage, setCardMessage] = useState('');
  const [activeStep, setActiveStep] = useState({ currentCard: 0 });
  const [open, setOpen] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState<string>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [myDeployments, setMyDeployments] = useRecoilState(myDeploymentsAtom);
  const [, setDeploymentRefresh] = useRecoilState(deploymentDataStale);
  const { mutateAsync: mxCreateDeployment, isLoading: deploymentProgressVisible } =
    useMutation(createDeployment);
  const { mutate: mxCreateLease, isLoading: leaseProgressVisible } = useMutation(createLease);
  const { mutate: mxSendManifest, isLoading: manifestSending } = useMutation(sendManifest);

  const progressVisible = deploymentProgressVisible || leaseProgressVisible || manifestSending;

  React.useEffect(() => {
    const params = [folderName, templateId && uriToName(templateId), intentId];
    const numParams = params.filter((x) => x !== undefined).length;

    setActiveStep({ currentCard: numParams });
  }, [folderName, templateId, intentId]);

  React.useEffect(() => {
    if (dseq) {
      setDeploymentId({
        owner: keplr.accounts[0].address,
        dseq,
      });
      setActiveStep({ currentCard: 4 });
      return;
    }
  }, [dseq, keplr]);

  const selectFolder = (folderName: string) => {
    navigate(`/new-deployment/${nameToURI(folderName)}`);
  };

  const selectTemplate = (templateId: string) => {
    if (folderName) {
      navigate(`/new-deployment/${nameToURI(folderName)}/${nameToURI(templateId)}`);
    }
  };

  const handlePreflightCheck = (intentId: string, sdl: SDLSpec | undefined) => {
    if (folderName && templateId && sdl) {
      setSdl(sdl);
      navigate(`/new-deployment/${nameToURI(folderName)}/${nameToURI(templateId)}/${intentId}`);
    }
  };

  const handleDeployment = (key: string, deployment: any) => {
    const newDeployments: { [key: string]: Deployment } = { ...myDeployments };
    newDeployments[key] = deployment;
    setMyDeployments(newDeployments);
  };

  const acceptBid = async (bidId: any) => {
    setCardMessage('Deploying');

    mxCreateLease(bidId, {
      onSuccess: (lease) => {
        logging.success('Create lease: successful');

        // if the user refreshed the page, the atom could be empty
        // if that's the case, used the stored version
        const cachedDetails = JSON.parse(localStorage.getItem(`${lease?.leaseId?.dseq}`) || '');
        const _sdl = sdl ? sdl : cachedDetails.sdl;

        if (lease) {
          mxSendManifest(
            { address: keplr.accounts[0].address, lease, sdl: _sdl },
            {
              onSuccess: (result) => {
                if (result) {
                  logging.success('Manifest sending: successful');
                  setDeploymentRefresh(true);
                  navigate(`/my-deployments/${dseq}`);
                }
              },
              onError: (error) => {
                logging.log(`Failed to send manifest: ${error}`);
              },
              onSettled: () => {
                navigate(`/my-deployments/${dseq}`);
              },
            }
          );
        }
      },
      onError: (error) => {
        logging.log(`Failed to create lease: ${error}`);
      },
    });
  };

  // Error handling dialog
  const handleClose = (reason: string) => {
    if (reason === 'closeButtonClick') {
      setOpen(false);
    }
  };

  // TODO: this should be changed to use the logging system, and not throw
  // additional exceptions.
  const handleError = async (maybeError: unknown, method: string) => {
    const error =
      maybeError && Object.prototype.hasOwnProperty.call(maybeError, 'message')
        ? (maybeError as Error)
        : { message: 'Unknown error' };

    let title = 'Error';
    let message = 'An error occurred while sending your request.';
    if (method === 'acceptBid') {
      title = 'Error Select Provider';
      message = 'An error occurred while selecting a provider.';
    }
    if (method === 'createDeployment') {
      title = 'Error Create Deployment';
      message = 'An error occurred while trying to deploy.';
      if (error.message.includes('Query failed with (6)')) {
        message = 'There was an RPC error. This may happen during upgrades to the Akash Network.';
      }
    }
    setErrorTitle(title);
    setErrorMessage(message);
    setCardMessage('');
    setOpen(true);
    // throw new Error(`${method}: ${error.message}`);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '450px', marginBottom: '25px' }}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (value: InitialValuesProps) => {
          // the onSubmit method is called from the component PreflightCheck.
          // it uses the useFormikContext hook.
          // const { submitForm } = useFormikContext();
          setCardMessage('Creating deployment');
          mxCreateDeployment({ sdl: value.sdl, depositor: value.depositor })
            .then(async (result) => {
              if (result && result.deploymentId) {
                setDeploymentId(result.deploymentId);
                setSdl(value.sdl);

                // set deployment to localStorage object using Atom
                const _deployment = await myDeploymentFormat(result, value);
                handleDeployment(_deployment.key, JSON.stringify(_deployment.data));

                // set deployment to localStorage item by dseq (deprecate ?)
                localStorage.setItem(_deployment.key, JSON.stringify(_deployment.data));

                // head to the bid selection page
                navigate(`/configure-deployment/${result.deploymentId.dseq}`);
              }
            })
            .catch((error) => handleError(error, 'createDeployment'));
        }}
      >
        {({ setFieldValue, values }) => {
          return (
            <>
              <Stepper activeStep={activeStep.currentCard} className="mb-12">
                {steps.map((label) => {
                  const stepProps: { completed?: boolean } = {};
                  const labelProps: {
                    optional?: React.ReactNode;
                  } = {};
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>

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
                          <Loading />
                          <Typography variant="h3">{cardMessage}</Typography>
                        </Stack>
                      </Slide>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {activeStep.currentCard === steps.length
                ? null
                : !progressVisible && (
                  <React.Fragment>
                    {activeStep.currentCard === 0 && (
                      <FeaturedApps
                        onDeployNowClick={(folderName) => {
                          selectFolder(folderName);
                        }}
                        callback={(sdl) =>
                          navigate('/new-deployment/custom-sdl', { state: { sdl: sdl } })
                        }
                        setFieldValue={setFieldValue}
                        onSave={function (sdl: any): void {
                          throw new Error('Function not implemented.');
                        }}
                      />
                    )}
                    {activeStep.currentCard === 1 && folderName && (
                      <SelectApp
                        folderName={uriToName(folderName)}
                        setFieldValue={setFieldValue}
                        onNextButtonClick={selectTemplate}
                      />
                    )}
                    {activeStep.currentCard === 2 && folderName && templateId && (
                      <ConfigureApp
                        folderName={uriToName(folderName)}
                        templateId={uriToName(templateId)}
                        onNextButtonClick={(intent: string) =>
                          handlePreflightCheck(intent, values.sdl)
                        }
                      />
                    )}
                    {activeStep.currentCard === 3 && <PreflightCheck />}
                    {activeStep.currentCard === 4 && deploymentId && (
                      <Suspense fallback={<Loading />}>
                        <SelectProvider
                          deploymentId={deploymentId}
                          onNextButtonClick={(bidId: any) => acceptBid(bidId)}
                        />
                      </Suspense>
                    )}
                  </React.Fragment>
                )}
            </>
          );
        }}
      </Formik>
      <Dialog
        open={open}
        onClose={handleClose}
        title={errorTitle || ''}
        message={errorMessage || ''}
      />
    </Box >
  );
};

export default DeploymentStepper;
