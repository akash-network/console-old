import React, { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { Template } from '../components/Template';
import { Button } from '@mui/material';
import { css } from '@emotion/react';
import { templateList } from '../recoil/api/sdl';
import Document from '../assets/images/document.svg';
import { SdlEditor } from '../components/SdlConfiguration/SdllEditor';
import { HelpCenterSDL } from '../components/HelpCenter/HelpCenterSDL';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const DocumentIcon = () => <img src={Document} alt="Document Icon" />;

export interface FeaturedAppsProps {
  onDeployNowClick: (dir: string) => void;
  callback: (sdl: any) => void;
  setFieldValue: (name: string, value: any) => void
}

export default function FeaturedApps(
  {
    onDeployNowClick,
    callback,
    setFieldValue
  }: FeaturedAppsProps): JSX.Element {
  const [numberOfTemplates, setNumberOfTemplates] = useState(templateList.length);
  const [reviewSdl, showSdlReview] = useState(false);
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  const toggleHelpCenter = useCallback(() => {
    setIsHelpCenterOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  return (
    <div className="container akt-card">
      <FeaturedAppsPageHeader>
        <PageTitleWrapper style={{ marginRight: 12 }}>
          <PageTitle>
            Get started with a ready template or upload your own SDL
          </PageTitle>
          <StyledHelpIcon onClick={toggleHelpCenter} />
        </PageTitleWrapper>
        <ImportSdlButton
          startIcon={<DocumentIcon />}
          variant="outlined"
          size="small"
          onClick={() => {
            setFieldValue('sdl', {});
            showSdlReview(true);
          }}
        >
          Import SDL
        </ImportSdlButton>
      </FeaturedAppsPageHeader>
      <Divider />
      <FeaturedAppsPageWrapper>
        {templateList.slice(0, numberOfTemplates).map((template: any) => {
          return <Template
            key={template.id}
            id={template.id}
            title={template.title}
            description={template.description}
            logo={template.logo}
            onNextButtonClick={() => onDeployNowClick(template.name)}
          />;
        })}
      </FeaturedAppsPageWrapper>
      <ViewAllButtonContainer>
        {templateList.length > numberOfTemplates && (
          <ViewAllButton
            fullWidth
            variant="outlined"
            onClick={() => setNumberOfTemplates(templateList.length)}
          >
            View All Apps
          </ViewAllButton>
        )}
      </ViewAllButtonContainer>
      <SdlEditor
        reviewSdl={reviewSdl}
        closeReviewModal={closeReviewModal}
        callback={callback}
      />
      <HelpCenterSDL
        isOpen={isHelpCenterOpen}
        onClose={toggleHelpCenter}
      />
    </div>
  );
}

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Divider = styled.div`
  width: 100%;
  background: #E5E7EB;
  height: 2px;
`;

const FeaturedAppsPageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 16px;
`;

const FeaturedAppsPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const PageTitle = styled.h3`
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  padding-right: 15px;
`;

const ViewAllButtonContainer = styled.div`
  width: 100%;
  display: flex;
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

const ViewAllButton = styled(Button)`
  ${GeneralButtonStyle}
`;

const ImportSdlButton = styled(Button)`
  ${GeneralButtonStyle};
  margin-top: 0;
`;

const StyledHelpIcon = styled(HelpOutlineIcon)`
  cursor: pointer;
  font-size: 18px;
  color: #717171;
`;