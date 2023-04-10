import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import styled from '@emotion/styled';
import {
  CancelButton,
  SaveButton,
  UpdateDeploymentAction
} from '../components/UpdateDeployment/styling';
import { fetchDeployment, sendManifest, updateDeployment } from '../recoil/api';
import { useRecoilValue } from 'recoil';
import { keplrState } from '../recoil/atoms';
import { Button } from '@mui/material';
import { css } from '@emotion/react';
import { SdlConfiguration } from '../components/SdlConfiguration/SdlConfiguration';
import {
  initialValues,
  InitialValuesProps,
  SdlConfigurationType,
  SDLSpec
} from '../components/SdlConfiguration/settings';
import logging from '../logging';
import { ManifestVersion } from '../_helpers/deployments-utils';
import useAppCache from '../hooks/useAppCache';
import { isError } from '../_helpers/types';

const UpdateDeployment: React.FC<any> = () => {
  const navigate = useNavigate();
  const { dseq } = useParams<any>();
  const keplr = useRecoilValue(keplrState);
  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const application = useAppCache(dseq);
  const [progressVisible, setProgressVisible] = useState(false);
  const [cardMessage, setCardMessage] = useState('');
  const [lease, setLease] = useState<any>();
  const [deployment, setDeployment] = useState<any>();

  useEffect(() => {
    if (!dseq) return;

    fetchDeployment(keplr.accounts[0].address, dseq)
      .then(deploy => {
        setDeployment(deploy.deployment.deployment);
        setLease(deploy?.leases?.leases[0].lease);
      });
  }, []);

  if (application === null) {
    return <>Invalid DSEQ</>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...initialValues, appName: application.name, sdl: application.sdl as SDLSpec }}
      onSubmit={async (value: InitialValuesProps) => {
        setProgressVisible(true);
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

        const newVersion = Buffer.from(await ManifestVersion(value.sdl)).toString('base64');
        const oldVersion = Buffer.from(deployment?.version).toString('base64');

        if (oldVersion === newVersion) {
          await sendManifest(keplr.accounts[0].address, lease, value.sdl)
            .then(() => logging.success('Manifest successfully updated'))
            .catch(error => logging.log(`Failed to send manifest: ${error}`));

          navigate(-1);
          return;
        }

        try {
          const result = await updateDeployment(keplr, {
            owner: keplr.accounts[0].address,
            dseq
          }, value.sdl);

          if (result.deploymentId && value.sdl) {
            setCardMessage('Sending manifest');

            await sendManifest(keplr.accounts[0].address, lease, value.sdl)
              .catch(error => logging.log(error));

            for (const [key,] of Object.entries(value.sdl.services)) {
              if (count === 0) {
                if (value.sdl.services[key] && value.sdl.services[key].image) {
                  image = value.sdl.services[key].image;
                }
                if (value.sdl.profiles.compute[key] && value.sdl.profiles.compute[key].resources) {
                  const resources = value.sdl.profiles.compute[key].resources;
                  cpu = resources.cpu.units;
                  memory = resources.memory.size;
                  storage = resources.storage.size;
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
                sdl: value.sdl,
              })
            );
            navigate(-1);
          }
        } catch (error) {
          // TODO: Implement appropriate error handling
          // Here we need to check it error.message is "Request rejected" which mean user clicked reject button
          // or it could also happen that user didn't change anything and error is "Query failed with (6): rpc error: code..." 
          if (isError(error)) {
            logging.error('UpdateDeployment.tsx' + error.message);
          }
          setProgressVisible(false);
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
            actionItems={() => (
              <UpdateDeploymentAction>
                <ReviewSdlButton onClick={() => showSdlReview(true)}>
                  View Parameter Editor
                </ReviewSdlButton>
                <CancelButton onClick={() => navigate(-1)}>
                  Cancel
                </CancelButton>
                <SaveButton onClick={() => submitForm()}>
                  Save
                </SaveButton>
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
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #D7D7D7;
  border-radius: 6px;

  &:hover {
    border-color: #3D4148
  }
`;

const ReviewSdlButton = styled(Button)`
  ${ButtonTemplate};
  margin-right: 20px;
  border-radius: 8px;
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 14px;
  box-shadow: 0px 1px 2px 0px #0000000D;

  &:hover {
    background-color: #F4F5F8
  }
`;