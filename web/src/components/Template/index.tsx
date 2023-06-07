import styled from '@emotion/styled/macro';
import { Avatar } from '@mui/material';
import ArrowRight from '../../assets/images/arrow-right-gray.svg';
import React from 'react';

interface TemplateProps {
  id: number;
  title: string;
  description: string;
  logo?: string;
  onNextButtonClick?: () => void;
}

const IconRight = () => <img src={ArrowRight} alt="Icon Right" />;

export const Template: React.FC<TemplateProps> = ({
  title,
  description,
  logo,
  onNextButtonClick,
}) => {
  return (
    <TemplateWrapper>
      <TemplateHeaderWrapper>
        <TemplateLogo>
          <Avatar src={logo} alt="Template Logo image" />
        </TemplateLogo>
        <TemplateHeader>
          <TemplateHeaderTitle>{title}</TemplateHeaderTitle>
        </TemplateHeader>
      </TemplateHeaderWrapper>
      <TemplateBody>
        <TemplateBodyText>{description}</TemplateBodyText>
      </TemplateBody>
      <TemplateFooter onClick={() => onNextButtonClick && onNextButtonClick()}>
        <IconRight />
        <TemplateDeployText>Deploy Now</TemplateDeployText>
      </TemplateFooter>
    </TemplateWrapper>
  );
};

const TemplateFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  padding: 19px 0;
  cursor: pointer;
`;

const TemplateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 24px;
  gap: 23px;
  flex: 1;
  min-width: 325px;
  height: 266px;

  background: #ffffff;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border-radius: 8px;

  &:hover {
    ${TemplateFooter} {
      background-color: #f9fafb;
      border-radius: 8px;
    }
  }
`;

const TemplateHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 18px;
`;

const TemplateHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const TemplateHeaderTitle = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
  order: 0;

  display: flex;
  align-items: center;
  letter-spacing: 0.01em;

  color: #3d4148;
`;

const TemplateLogo = styled.div`
  margin-right: 20px;
`;

const TemplateBody = styled.div`
  gap: 55px;
  display: flex;
  flex-direction: column;
  padding: 0 18px;
`;

const TemplateBodyText = styled.p`
  font-family: Satoshi-Regular, serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.015em;
  color: #6b7280;
`;

const TemplateDeployText = styled.p`
  padding-left: 20px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
`;
