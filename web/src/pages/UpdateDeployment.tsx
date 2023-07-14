import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import styled from '@emotion/styled';
import {
  CancelButton,
  SaveButton,
  UpdateDeploymentAction,
} from '../components/UpdateDeployment/styling';
import { useRecoilValue } from 'recoil';
import { keplrState } from '../recoil/atoms';
import { Button } from '@mui/material';
import { css } from '@emotion/react';
import { SdlConfiguration } from '../components/SdlConfiguration/SdlConfiguration';
import {
  initialValues,
  InitialValuesProps,
  SdlConfigurationType,
  SDLSpec,
} from '../components/SdlConfiguration/settings';
import logging from '../logging';
import { ManifestVersion } from '../_helpers/deployments-utils';
import useAppCache from '../hooks/useAppCache';
import { isError } from '../_helpers/types';
import { getRpcNode } from '../hooks/useRpcNode';
import { deploymentInfo, queryLease } from '../api/queries';
import { useMutation, useQuery } from 'react-query';
import { sendManifest, updateDeployment } from '../api/mutations';

const UpdateDeployment: React.FC<any> = () => {
  const navigate = useNavigate();
  const { dseq } = useParams<{ dseq: string }>();
  const keplr = useRecoilValue(keplrState);
  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const application = useAppCache(dseq);
  const [cardMessage, setCardMessage] = useState('');
  const { networkType } = getRpcNode();

  const deploymentId = {
    owner: keplr.accounts[0].address,
    dseq: dseq || '0',
  };
  const { data: deploymentResponse } = useQuery(['deployment', deploymentId], deploymentInfo);

  const leaseId = {
    owner: keplr.accounts[0].address,
    dseq: dseq || '0',
  };
  const { data: leaseResponse } = useQuery(['lease', leaseId], queryLease);

  // mutations
  const { mutate: mxSendManifest, isLoading: isSendingManifest } = useMutation(sendManifest);
  const { mutate: mxUpdateDeployment, isLoading: isUpdatingDeployment } =
    useMutation(updateDeployment);

  const deployment = deploymentResponse?.deployment?.deployment;
  const lease = leaseResponse?.leases.length ? leaseResponse.leases[0].lease : undefined;

  const progressVisible = isSendingManifest || isUpdatingDeployment;

  const rpcVersion = networkType === 'testnet' ? 'beta3' : 'beta2';

  if (application === null) {
    return <>Invalid DSEQ</>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...initialValues,
        appName: application.name,
        sdl: application.sdl as SDLSpec,
      }}
      onSubmit={async (value: InitialValuesProps) => {
        setCardMessage('Updating deployment');
        let image = 'n/a';
        let cpu: any = 'n/a';
        let memory = 'n/a';
        let storage = 'n/a';
        let count = 0;

        if (!value.sdl) {
          console.log('Update deployment called with invalid SDL');
          return;
        }

        const manifestVersion = await ManifestVersion(value.sdl, rpcVersion);
        const newVersion = Buffer.from(manifestVersion).toString('base64');
        const oldVersion = Buffer.from((deployment as any)?.version).toString('base64');

        if (!lease) {
          return;
        }

        if (oldVersion === newVersion) {
          mxSendManifest(
            { address: keplr.accounts[0].address, lease, sdl: value.sdl },
            {
              onSuccess: () => {
                logging.success('Manifest successfully updated');
                navigate(-1);
              },
              onError: (error: any) => {
                logging.log(`Failed to send manifest: ${error}`);
              },
            }
          );

          return;
        }

        try {
          mxUpdateDeployment(
            {
              deploymentId: {
                owner: keplr.accounts[0].address,
                dseq,
              },
              sdl: value.sdl,
            },
            {
              onSuccess: (result: any) => {
                if (result.deploymentId && value.sdl) {
                  setCardMessage('Sending manifest');

                  mxSendManifest(
                    { address: keplr.accounts[0].address, lease, sdl: value.sdl },
                    {
                      onSuccess: () => {
                        const sdl = value.sdl as SDLSpec;

                        for (const [key] of Object.entries(sdl.services)) {
                          if (count === 0) {
                            if (sdl.services[key] && sdl.services[key].image) {
                              image = sdl.services[key].image;
                            }
                            if (sdl.profiles.compute[key] && sdl.profiles.compute[key].resources) {
                              const resources = sdl.profiles.compute[key].resources;
                              cpu = resources.cpu.units;
                              memory = resources.memory.size;
                              storage = Array.isArray(resources.storage)
                                ? resources.storage[0].size
                                : resources.storage.size;
                            }
                          }
                          count++;
                        }
                        localStorage.setItem(
                          `${result.deploymentId.dseq}`,
                          JSON.stringify({
                            name: value.appName,
                            image,
                            cpu,
                            memory,
                            storage,
                            sdl,
                          })
                        );
                        navigate(-1);
                      },
                      onError: (error: any) => {
                        logging.error('UpdateDeployment.tsx' + error.message);
                      },
                    }
                  );
                }
              },
              onError: (error: any) => {
                logging.error('UpdateDeployment.tsx' + error.message);
              },
            }
          );
        } catch (error) {
          // TODO: Implement appropriate error handling
          // Here we need to check it error.message is "Request rejected" which mean user clicked reject button
          // or it could also happen that user didn't change anything and error is "Query failed with (6): rpc error: code..."
          if (isError(error)) {
            logging.error('UpdateDeployment.tsx' + error.message);
          }
          setCardMessage('');
        }
      }}
    >
      {({ values, submitForm }) => {
        return (
          <SdlConfiguration
            sdl={values.sdl}
            reviewSdl={reviewSdl}
            closeReviewModal={closeReviewModal}
            configurationType={SdlConfigurationType.Update}
            progressVisible={progressVisible}
            cardMessage={cardMessage}
            onSave={submitForm} // Add the onSave prop
            actionItems={() => (
              <UpdateDeploymentAction>
                <ReviewSdlButton onClick={() => showSdlReview(true)}>
                  View Parameter Editor
                </ReviewSdlButton>
                <CancelButton onClick={() => navigate(-1)}>Cancel</CancelButton>
                <SaveButton onClick={() => submitForm()}>Save</SaveButton>
              </UpdateDeploymentAction>
            )}
          />
        );
      }}
    </Formik>
  );
};

export default UpdateDeployment;

const ButtonTemplate = css`
  padding: 10px 32px;
  gap: 8px;
  color: #374151;
  text-transform: capitalize;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #d7d7d7;
  border-radius: 6px;

  &:hover {
    border-color: #3d4148;
  }
`;

const ReviewSdlButton = styled(Button)`
  ${ButtonTemplate};
  margin-right: 20px;
  border-radius: 8px;
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 14px;
  box-shadow: 0px 1px 2px 0px #0000000d;

  &:hover {
    background-color: #f4f5f8;
  }
`;
