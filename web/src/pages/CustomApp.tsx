import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import { Formik } from 'formik';
import { SdlConfiguration } from '../components/SdlConfiguration/SdlConfiguration';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deploymentSdl, keplrState } from '../recoil/atoms';
import Keplr from '../components/KeplrLogin';
import SelectProvider from './SelectProvider';
import { transformSdl } from '../_helpers/helpers';
import {
  initialValues,
  InitialValuesProps,
  SdlConfigurationType,
  SDLSpec,
} from '../components/SdlConfiguration/settings';
import { Icon } from '../components/Icons';
import { isError } from '../_helpers/types';
import { PreflightCheck } from './PreflightCheck';
import { createDeployment, createLease, sendManifest } from '../api/mutations';
import { useMutation } from 'react-query';
import { getRpcNode } from '../hooks/useRpcNode';
import logging from '../logging';

const CustomApp: React.FC = () => {
  const { networkType } = getRpcNode();
  const navigate = useNavigate();
  const keplr = useRecoilValue(keplrState);
  const [deploymentId, setDeploymentId] = useState<{ owner: string; dseq: string }>();
  const { intentId, dseq } = useParams();
  const [sdl, setSdl] = useRecoilState(deploymentSdl);
  const [cardMessage, setCardMessage] = useState('');
  const [activeStep, setActiveStep] = useState({ currentCard: 1 });

  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const { state } = useLocation();

  const { mutate: mxCreateDeployment, isLoading: isCreatingDeployment } =
    useMutation(createDeployment);
  const { mutate: mxCreateLease, isLoading: isCreatingLease } = useMutation(createLease);
  const { mutate: mxSendManifest, isLoading: isSendingManifest } = useMutation(sendManifest);

  const progressVisible = isCreatingDeployment || isCreatingLease || isSendingManifest;

  useEffect(() => {
    if (intentId && !dseq) {
      setActiveStep({ currentCard: 2 });
    } else if (dseq) {
      setDeploymentId({
        owner: keplr.accounts[0].address,
        dseq,
      });
      setActiveStep({ currentCard: 3 });
      return;
    }
  }, [dseq, intentId, keplr]);

  const handlePreflight = (intentId: string, sdl: SDLSpec | undefined) => {
    if (sdl) {
      setSdl(sdl);
      navigate(`/new-deployment/custom-sdl/${intentId}`, { state: { sdl } });
    }
  };

  const acceptBid = async (bidId: any) => {
    setCardMessage('Creating lease');

    try {
      mxCreateLease(bidId, {
        onSuccess: (lease) => {
          if (lease) {
            setCardMessage('Sending manifest');
            mxSendManifest({ address: keplr.accounts[0].address, lease, sdl });
          } else {
            setCardMessage('Could not create lease.');
          }
        },
      });
    } catch (error: unknown) {
      if (isError(error)) {
        console.log('CustomApp.tsx' + error.message);
      }

      setCardMessage('');
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '450px', marginBottom: '25px' }}>
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues, sdl: transformSdl(state.sdl) }}
        onSubmit={async (values, { setSubmitting, setFieldValue }) => {
          setCardMessage('Creating deployment');

          setCardMessage('Creating deployment');
          try {
            if (!values.sdl) {
              logging.error('No SDL found');
              return;
            }

            mxCreateDeployment(
              { sdl: values.sdl },
              {
                onSuccess: (result) => {
                  if (result && result.deploymentId) {
                    setDeploymentId(result.deploymentId);
                    setSdl(values.sdl);
                    navigate(`/configure-deployment/${result.deploymentId.dseq}`);

                    localStorage.setItem(
                      `${result.deploymentId.dseq}`,
                      JSON.stringify({
                        name: values.appName,
                        sdl: values.sdl,
                      })
                    );
                  }
                },
              }
            );
          } catch (error) {
            if (isError(error)) {
              console.log('CustomApp.tsx' + error.message);
            }
            setCardMessage('');
          }
        }}
      >
        {({ values, submitForm, setFieldValue }) => {
          return (
            <>
              {!progressVisible && activeStep.currentCard === 1 && (
                <SdlConfiguration
                  sdl={values.sdl}
                  reviewSdl={reviewSdl}
                  closeReviewModal={closeReviewModal}
                  configurationType={SdlConfigurationType.Create}
                  progressVisible={progressVisible}
                  cardMessage={cardMessage}
                  onSave={(updatedSdl) => setFieldValue('sdl', updatedSdl)}
                  actionItems={() => (
                    <DeploymentAction>
                      <Button variant="outlined" onClick={() => showSdlReview(true)}>
                        <span className="mr-2">Review SDL</span> <Icon type="edit" />
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handlePreflight('preflight-check', values.sdl)}
                      >
                        Create Deployment
                      </Button>
                    </DeploymentAction>
                  )}
                />
              )}

              {!progressVisible &&
                activeStep.currentCard === 2 &&
                intentId === 'preflight-check' && <PreflightCheck />}

              {!progressVisible && activeStep.currentCard === 3 && deploymentId && (
                <Keplr>
                  <SelectProvider
                    deploymentId={deploymentId}
                    onNextButtonClick={(bidId: any) => acceptBid(bidId)}
                  />
                </Keplr>
              )}
            </>
          );
        }}
      </Formik>
    </Box>
  );
};

export default CustomApp;

const DeploymentAction = styled.div`
  display: flex;
  justify-content: flex-end;

  Button {
    margin-right: 10px;
  }
`;
