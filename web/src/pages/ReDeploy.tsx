import React, { useCallback, useState } from 'react';
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
import { isError } from '../_helpers/types';
import { createDeployment } from '../api/mutations';
import { useMutation } from 'react-query';

const ReDeploy: React.FC<any> = () => {
  const navigate = useNavigate();
  const { dseq } = useParams<any>();
  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const [cardMessage, setCardMessage] = useState('');
  const [appData, setAppData] = useState<{ name: string; sdl?: SDLSpec } | null>(null);
  const {
    mutate: mxCreateDeployment,
    isLoading: progressVisible,
    data: result,
  } = useMutation(createDeployment);

  const appCache = dseq ? localStorage.getItem(dseq) : null;

  const application = appCache ? (JSON.parse(appCache) as { name: string; sdl: SDLSpec }) : null;

  const handleSubmit = async (values: InitialValuesProps) => {
    setCardMessage('Creating deployment');
    setAppData({ name: values.appName, sdl: values.sdl });
    mxCreateDeployment({ sdl: values.sdl });
  };

  const handleSave = (sdl: SDLSpec) => {
    mxCreateDeployment({ sdl }); // Trigger the deployment mutation
  };

  React.useEffect(() => {
    if (progressVisible == false && result && result.deploymentId) {
      navigate(`/configure-deployment/${result.deploymentId.dseq}`);
      localStorage.setItem(`${result.deploymentId.dseq}`, JSON.stringify(appData));
    }
  }, [progressVisible, result, appData]);

  if (application === null) {
    return <></>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...initialValues, appName: application.name, sdl: application.sdl }}
      onSubmit={handleSubmit}
    >
      {({ values, submitForm }) => {
        return (
          <SdlConfiguration
            sdl={values.sdl}
            reviewSdl={reviewSdl}
            closeReviewModal={closeReviewModal}
            configurationType={SdlConfigurationType.ReDeploy}
            progressVisible={progressVisible}
            cardMessage={cardMessage}
            onSave={handleSave}
            actionItems={() => (
              <UpdateDeploymentAction>
                <ReviewSdlButton onClick={() => showSdlReview(true)}>Review SDL</ReviewSdlButton>
                <CancelButton onClick={() => navigate(-1)}>Cancel</CancelButton>
                <SaveButton onClick={() => submitForm()}>Deploy</SaveButton>
              </UpdateDeploymentAction>
            )}
          />
        );
      }}
    </Formik>
  );
};

export default ReDeploy;

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
