import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useNavigate} from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
} from '@mui/material';
import { Icon, IconType } from '../Icons';
import { useQuery } from 'react-query';
import { fetchLandingPageMetadata } from '../../recoil/api/sdl';

export interface DeploymentStepperProps {
  dseq?: string;
  leaseId?: string;
}

const DeploymentStepper: React.FC<DeploymentStepperProps> = () => {
  const navigate = useNavigate();
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
  console.log(landingPageMetadata);

  return (
    <Box sx={{ width: '100%', minHeight: '450px', marginBottom: '25px' }}>
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
              // PRODUCT-CLARIFY: what's the import sdl even doing on the /landing/node-deployment route
              // TODO: re-create the flow of Import SDL on /landing/node-deployment
            }}
            disabled={!customSDLTile.buttonEnabled}
          >
            {customSDLTile.buttonEnabled ? customSDLTile.buttonText : 'Coming soon...'}
          </ChooseTemplateButton>
        </CategoryCard>

      </FeaturedAppsPageWrapper>
    </Box>
  );
};

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

export default DeploymentStepper;
