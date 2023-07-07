import React, {useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Divider,
} from '@mui/material';
import { useQuery } from 'react-query';
import { fetchLandingPageMetadata } from '../../recoil/api/sdl';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Formik } from 'formik';
import { deploymentSdl, keplrState, myDeployments as myDeploymentsAtom } from '../../recoil/atoms';
import { createDeployment } from '../../recoil/api';
import { Dialog } from '../Dialog';
import { initialValues, InitialValuesProps } from '../SdlConfiguration/settings';
import { myDeploymentFormat } from '../../_helpers/my-deployment-utils';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { SdlGuideContainer } from './SdlGuideContainer';
import { CategoryCardsContainer } from './CategoryCardsContainer';

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
  const [progressVisible, setProgressVisible] = useState(false);
  const [cardMessage, setCardMessage] = useState('');
  const [activeStep, setActiveStep] = useState({ currentCard: 0 });
  const [open, setOpen] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState<string>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [myDeployments, setMyDeployments] = useRecoilState(myDeploymentsAtom);


  const { data: landingPageMetadata } = useQuery('landingPageMetadata', fetchLandingPageMetadata, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

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


  const handleDeployment = (key: string, deployment: any) => {
    const newDeployments: { [key: string]: Deployment } = { ...myDeployments };
    newDeployments[key] = deployment;
    setMyDeployments(newDeployments);
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
    const error = maybeError && Object.prototype.hasOwnProperty.call(maybeError, 'message')
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
    setProgressVisible(false);
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
          setProgressVisible(true);
          console.log('sometime soon');
          setCardMessage('Creating deployment');

          try {
            const result = await createDeployment(keplr, value.sdl, value.depositor);
            if (result && result.deploymentId) {
              setDeploymentId(result.deploymentId);
              setSdl(value.sdl);

              // wait a second to give the blockchain a chance to setup
              // the bids for the deployment
              setTimeout(() => {
                setProgressVisible(false);
                navigate(`/configure-deployment/${result.deploymentId.dseq}`);
              }, 2000);

              // set deployment to localStorage object using Atom
              const _deployment = await myDeploymentFormat(result, value);
              handleDeployment(_deployment.key, JSON.stringify(_deployment.data));

              // set deployment to localStorage item by dseq (deprecate ?)
              localStorage.setItem(_deployment.key, JSON.stringify(_deployment.data));
            }
          } catch (error) {
            await handleError(error, 'createDeployment');
          }
        }}
      >
        {({ setFieldValue }) => {
          return (
            <>
              <IntroHeading>What would you like to do today?</IntroHeading>
              <Divider style={{ marginTop: '20px', marginBottom: '32px' }} />
              <CategoryCardsContainer categoriesTiles={landingPageMetadata?.categoriesTiles} setFieldValue={setFieldValue} />
              <Divider style={{ marginTop: '32px', marginBottom: '72px' }} />
              <SdlGuideContainer sdlGuideTiles={landingPageMetadata?.sdlGuideTiles} />
            </>
          );
        }}
      </Formik>
      <Dialog open={open} onClose={handleClose} title={errorTitle || ''} message={errorMessage || ''} />
    </Box>);
};

const IntroHeading = styled.h2<{ fontWeight?: number }>`
  font-weight: ${(props) => props?.fontWeight ?? 700};
  font-size: 24px;
  line-height: 32px;
  color: #111827;
`;

export default DeploymentStepper;

