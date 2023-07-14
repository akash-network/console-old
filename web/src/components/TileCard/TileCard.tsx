import React, { Suspense, useState, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SdlEditor } from '../../components/SdlConfiguration/SdllEditor';
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
import './TileCard.css';
interface Props {
  item: {
    title: string;
    image: string;
    description: string;
    buttonText: string;
  };
}

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

function TileCard(props: Props) {
  const { title, image, description, buttonText } = props.item;
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
  const { mutate: mxCreateDeployment, isLoading: deploymentProgressVisible } =
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

  const handleSdlEditorSave = (sdl: any) => {
    navigate('/new-deployment/custom-sdl', { state: { sdl: sdl } });
  };

  const handleDeployment = (key: string, deployment: any) => {
    const newDeployments: { [key: string]: Deployment } = { ...myDeployments };
    newDeployments[key] = deployment;
    setMyDeployments(newDeployments);
  };

  const [reviewSdl, setReviewSdl] = useState(false);
  const closeReviewModal = useCallback(() => setReviewSdl(false), []);

  const handleImportSDL = () => {
    setReviewSdl(true);
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
    throw new Error(`${method}: ${error.message}`);
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

          try {
            const result = mxCreateDeployment(
              { sdl: value.sdl, depositor: value.depositor },
              {
                onSuccess: async (result) => {
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
                },
              }
            );
          } catch (error) {
            await handleError(error, 'createDeployment');
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <>
            <div key={title}>
              <div className="tile_card">
                <div style={{ margin: '20px' }}>
                  <div className="flex tile_wrapper">
                    <img src={image} alt={title} />
                    <p className="tile-card_title">{title}</p>
                  </div>
                  <p className="tile-card_desc">{description}</p>
                  <button className="tile_btn">{buttonText}</button>
                </div>
              </div>
            </div>

            {activeStep.currentCard === steps.length
              ? null
              : !progressVisible && (
                  <React.Fragment>
                    {activeStep.currentCard === 0 && (
                      <button
                        onClick={() => {
                          setFieldValue('sdl', {});
                          handleImportSDL();
                          setReviewSdl(true);
                        }}
                      >
                        Import SDL
                      </button>
                    )}

                    <SdlEditor
                      reviewSdl={reviewSdl}
                      closeReviewModal={closeReviewModal}
                      onSave={handleSdlEditorSave} // Pass the callback prop
                    />
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
        )}
      </Formik>
    </Box>
  );
}

export default TileCard;
