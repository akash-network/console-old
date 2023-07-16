/* eslint-disable quotes */
import React, { Suspense, useState, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SdlEditor } from '../../components/SdlConfiguration/SdllEditor';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
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
    route: string;
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

  const handleOtherButtonClick = () => {
    console.log('Other button clicked');
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
    throw new Error(`${method}: ${error.message}`);
  };

  return (
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
                {activeStep.currentCard === steps.length
                  ? null
                  : !progressVisible && (
                      <React.Fragment>
                        {activeStep.currentCard === 0 && buttonText === 'Import SDL' && (
                          <button
                            className="tile_btn"
                            onClick={() => {
                              setFieldValue('sdl', {});
                              handleImportSDL();
                              setReviewSdl(true);
                            }}
                          >
                            {buttonText}
                          </button>
                        )}

                        {activeStep.currentCard === 0 && buttonText === 'Choose a Template' && (
                          <button className="tile_btn">
                            <Link to={props.item.route}>{buttonText}</Link>
                          </button>
                        )}

                        {activeStep.currentCard === 0 && buttonText === 'Coming Soon' && (
                          <button style={{ cursor: 'default' }} className="tile_btn">
                            {buttonText}
                          </button>
                        )}
                        <SdlEditor
                          reviewSdl={reviewSdl}
                          closeReviewModal={closeReviewModal}
                          onSave={handleSdlEditorSave}
                        />
                      </React.Fragment>
                    )}
              </div>
            </div>
          </div>
        </>
      )}
    </Formik>
  );
}

export default TileCard;
