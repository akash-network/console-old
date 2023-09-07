/* eslint-disable quotes */
import React, { Suspense, useState, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SdlEditor } from '../../components/SdlConfiguration/SdllEditor';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { Formik } from 'formik';
import {
  deploymentDataStale,
  deploymentSdl,
  keplrState,
  myDeployments as myDeploymentsAtom,
} from '../../recoil/atoms';
interface Props {
  item: {
    route: string;
    title: string;
    image: string;
    description: string;
    buttonText: string;
    buttonClass?: string;
  };
}

import { initialValues, InitialValuesProps, SDLSpec } from '../SdlConfiguration/settings';
import { myDeploymentFormat } from '../../_helpers/my-deployment-utils';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { useMutation } from 'react-query';
import { createDeployment, createLease, sendManifest } from '../../api/mutations';

const steps = ['Featured Apps', 'Select', 'Configure', 'Review', 'Deploy'];

export interface DeploymentStepperProps {
  dseq?: string;
  leaseId?: string;
}

function TileCard(props: Props) {
  const { title, image, description, buttonText, buttonClass } = props.item;
  const keplr = useRecoilValue(keplrState);
  const navigate = useNavigate();
  const [deploymentId, setDeploymentId] = React.useState<{ owner: string; dseq: string }>();
  const { dseq } = useParams();
  const [sdl, setSdl] = useRecoilState(deploymentSdl);
  const [cardMessage, setCardMessage] = useState('');
  const [activeStep, setActiveStep] = useState({ currentCard: 0 });

  const [open, setOpen] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState<string>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [myDeployments, setMyDeployments] = useRecoilState(myDeploymentsAtom);
  const { mutate: mxCreateDeployment } = useMutation(createDeployment);

  const handleTileActionClick = useCallback((route: string) => {
    return () => navigate(route);
  }, [navigate]);

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
          <div key={title} className="h-full">
            <div className="max-w-sm w-full h-full xl:h-[310px] lg:h-[300px] md:w-[310px] lg:w-[300px] xl:w-[330px]  bg-white border border-[#0000001A] rounded-lg">
              <div className="h-full p-5">
                <div className="flex flex-col h-full gap-4">
                  <div className="flex gap-4">
                    <img className="" src={image} alt="" />
                    <p className="font-bold text-[18px] mt-3 leading-6">{title}</p>
                  </div>
                  <p className=" mt-[30px] text-[16px] leading-6  ">{description}</p>
                  <div className="flex-grow"></div>
                  <div className="">
                    {buttonText === 'Import SDL' && (
                      <TemplateBtn>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFieldValue('sdl', {});
                            handleImportSDL();
                            setReviewSdl(true);
                          }}
                        >
                          {buttonText}
                        </Button>
                      </TemplateBtn>
                    )}

                    {buttonText === 'Choose a Template' && (
                      <TemplateBtn>
                        <Button variant="outlined" onClick={handleTileActionClick(props.item.route)}>
                          {buttonText}
                        </Button>
                      </TemplateBtn>
                    )}

                    {buttonText === 'Coming Soon' && (
                      <TemplateBtn>
                        <Button disabled variant="outlined">
                          {buttonText}
                        </Button>
                      </TemplateBtn>
                    )}
                  </div>

                  <SdlEditor
                    reviewSdl={reviewSdl}
                    closeReviewModal={closeReviewModal}
                    onSave={handleSdlEditorSave}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Formik>
  );
}

export default TileCard;

const TemplateBtn = styled.div`
      display: flex;
      justify-content: center;
      margin-top: 40px;
      Button {
        width: 100%;
      padding: 8px, 16px, 8px, 16px;
  }
      `;
