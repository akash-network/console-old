import React, {useState, useCallback, Suspense} from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
} from '@mui/material';
import { Icon, IconType } from '../Icons';
import { useQuery } from 'react-query';
import { fetchLandingPageMetadata } from '../../recoil/api/sdl';
import { SdlEditor } from '../SdlConfiguration/SdllEditor';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Formik } from 'formik';
import { deploymentSdl, keplrState, myDeployments as myDeploymentsAtom } from '../../recoil/atoms';
import { createDeployment } from '../../recoil/api';
import { Dialog } from '../Dialog';

export interface DeploymentStepperProps {
  dseq?: string;
  leaseId?: string;
}

import { initialValues, InitialValuesProps } from '../SdlConfiguration/settings';
import { myDeploymentFormat } from '../../_helpers/my-deployment-utils';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';


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
  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);

  const customSDLTile = {
    'title': 'Custom Application',
    'description': 'Define your unique deployment requirements and preferences with SDL and deploy with ease on the flexible and reliable Akash network.',
    'buttonText': 'Import SDL',
    'icon': 'code',
    'buttonEnabled': true
  };

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
              <FeaturedAppsPageWrapper>
                {landingPageMetadata?.categoriesTiles?.tiles?.map((c: any) => {
                  return <CategoryCard key={c.title}>
                    <CategoryCardHeaderWithIcon>
                      <IconWrapper>
                        <Icon type={(c.icon as IconType)} />
                      </IconWrapper>
                      <CategoryCardHeading>
                        {c.title}
                      </CategoryCardHeading>
                    </CategoryCardHeaderWithIcon>
                    <CategoryCardDescription>
                      {c.description}
                    </CategoryCardDescription>
                    <ChooseTemplateButton
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        navigate(c.route);
                      }}
                      disabled={!c.buttonEnabled}
                    >
                      {c.buttonEnabled ? c.buttonText : 'Coming soon...'}
                    </ChooseTemplateButton>
                  </CategoryCard>;
                })}

                <CategoryCard key={customSDLTile.title}>
                  <CategoryCardHeaderWithIcon>
                    <IconWrapper>
                      <Icon type={(customSDLTile.icon as IconType)} />
                    </IconWrapper>
                    <CategoryCardHeading>
                      {customSDLTile.title}
                    </CategoryCardHeading>
                  </CategoryCardHeaderWithIcon>
                  <CategoryCardDescription>
                    {customSDLTile.description}
                  </CategoryCardDescription>
                  <ChooseTemplateButton
                    fullWidth
                    variant='outlined'
                    onClick={() => {
                      showSdlReview(true);
                      setFieldValue('sdl', {});
                    }}
                    disabled={!customSDLTile.buttonEnabled}
                  >
                    {customSDLTile.buttonEnabled ? customSDLTile.buttonText : 'Coming soon...'}
                  </ChooseTemplateButton>
                </CategoryCard>
                <SdlEditor
                  reviewSdl={reviewSdl}
                  closeReviewModal={closeReviewModal}
                  callback={(sdl) =>
                    navigate('/new-deployment/custom-sdl', { state: { sdl: sdl } })
                  }
                />
              </FeaturedAppsPageWrapper>

              <Divider style={{ marginTop: '32px', marginBottom: '72px' }} />

              <HowItWorksGuideContainer>
                <GuideContainerHeaderElement>
                  <GuidedHeader>
                    {landingPageMetadata?.sdlGuideTiles?.introText}
                  </GuidedHeader>
                  <GuidedHeaderDescription>
                    {landingPageMetadata?.sdlGuideTiles?.introDescription}
                  </GuidedHeaderDescription>
                </GuideContainerHeaderElement>
                {landingPageMetadata?.sdlGuideTiles?.tiles?.map((c: any) => {
                  return (
                    <GuideContainerElement key={c.text}>
                      <GuideImageWrapper>
                        <img src={'https://raw.githubusercontent.com/akash-network/deploy-templates/main' + c.image} />
                      </GuideImageWrapper>
                      <GuidedHeader2>{c.step}</GuidedHeader2>
                      <GuidedHeader2>{c.text}</GuidedHeader2>
                    </GuideContainerElement>
                  );
                })}
              </HowItWorksGuideContainer>
            </>
          );
        }}
      </Formik>
      <Dialog open={open} onClose={handleClose} title={errorTitle || ''} message={errorMessage || ''} />
    </Box>);
};

const GuideImageWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const GuidedHeaderDescription = styled.div`
  font-size: 16px;
  line-height: 24px;
  margin-top: 8px;

  color: rgba(0, 0, 0, 0.5);
`;

const GuidedHeader2 = styled.h3`
  font-weight: 700;
  font-size: 18px;
  line-height: 20px;
  /* identical to box height, or 111% */


  color: #111827;
`;

const GuidedHeader = styled.h2`
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;

  color: #111827;
`;

const GuideContainerElement = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  flex: 1;
  min-width: 318.75px;
  height: 280px;
`;

const IntroHeading = styled.h2<{ fontWeight?: number }>`
  font-weight: ${(props) => props?.fontWeight ?? 700};
  font-size: 24px;
  line-height: 32px;
  color: #111827;
`;

const FeaturedAppsPageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 16px;
`;

const HowItWorksGuideContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  padding: 24px;
  gap: 24px;

  width: 100%;

  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const CategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  gap: 24px;

  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;

  flex: 1;
  min-width: 330.75px;
  min-height: 288px;
`;

const CategoryCardDescription = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.5);
`;

const CategoryCardHeading = styled.h2`
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  color: #111827;
`;

const CategoryCardHeaderWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  background: #EDEDED;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GeneralButtonStyle = css`
  font-family: 'Satoshi-medium', serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  padding: 13px 25px 13px 25px;
  line-height: 15px;
  color: #1C1B1B;
  width: auto;
  margin-top: 20px;
  gap: 8px;
  text-transform: capitalize;
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #D7D7D7;
  border-radius: 6px;

  &:hover {
    background-color: #F9FAFB;
    border: 1px solid #D1D5DB;
  }
`;

const ChooseTemplateButton = styled(Button)`
  ${GeneralButtonStyle}
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 10px;

  background: #FFFFFF;
  border: 1px solid #D8D7D7;
  border-radius: 6px;

  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: #0F172A;

  /* overriding GeneralButtonStyle */
  width: 100%;
`;

const GuideContainerHeaderElement = styled(GuideContainerElement)`
  justify-content: flex-start;
  height: auto;
`;


export default DeploymentStepper;

