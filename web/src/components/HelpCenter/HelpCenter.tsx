import React from 'react';
import {
  HelpCenterWrapper,
  HelpCenterOverlay,
  HelpCenterTitle,
  CloseButton,
  ContentBody,
  HelpCenterContent,
  CardTitle,
  CardTitle2,
  CardTitle3,
  Card,
  CardBody,
  HelpCenterFooter,
  FooterEntry,
  ContentTitle,
  FooterWrapper,
} from './HelpCenter.styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  contentData: ContentItem[]; // Define the contentData type
}
interface InternalLink {
  title: string;
  link: string;
}

export interface ContentItem {
  type?: 'card' | 'largeCard' | 'contentBody'; // Add a type field
  title?: string;
  body?: string;
  link?: string;
  contentTitle?: string;
  contentBody?: string;
  footer?: boolean;
  internalLinks?: InternalLink[];
  // Add internalLinks field
}

interface LargeCardComponentProps {
  internalLinks: InternalLink[];
  header?: string;
  footerLink?: string;
  footerContent?: string;
  footerLinkTitle?: string;
}

const LargeCardComponent: React.FC<LargeCardComponentProps> = ({
  internalLinks,
  footerLink,
  footerContent,
  header,
  footerLinkTitle,
}) => (
  <Card>
    <ContentBody>{header}</ContentBody>
    {internalLinks.map((link, index) => (
      <React.Fragment key={index}>
        <a href={link.link} target="_blank" rel="noreferrer">
          <CardTitle2>
            {link.title}
            <OpenInNewIcon
              fontSize="inherit"
              style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.875rem' }}
            />
          </CardTitle2>
        </a>
      </React.Fragment>
    ))}
    <div style={{ padding: '4px' }}></div>
    <ContentBody>{footerContent}</ContentBody>
    <a href={footerLink} target="_blank" rel="noreferrer">
      <CardTitle3>
        {footerLinkTitle}
        <OpenInNewIcon
          fontSize="inherit"
          style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.875rem' }}
        />
      </CardTitle3>
    </a>
  </Card>
);

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose, contentData }) => {
  if (!isOpen) return null;

  return (
    <>
      <HelpCenterOverlay onClick={onClose} />
      <HelpCenterWrapper>
        <HelpCenterTitle>
          Help Center
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </HelpCenterTitle>

        <HelpCenterContent>
          {contentData.map((item: ContentItem, index: number) => {
            switch (item.type) {
              case 'contentBody':
                return (
                  <React.Fragment key={index}>
                    {item.contentTitle && <ContentTitle>{item.contentTitle}</ContentTitle>}
                    {item.contentBody && (
                      <ContentBody
                        dangerouslySetInnerHTML={{ __html: item.contentBody }}
                      ></ContentBody>
                    )}
                  </React.Fragment>
                );
              case 'largeCard':
                return (
                  <React.Fragment key={index}>
                    {item.internalLinks && (
                      <LargeCardComponent
                        internalLinks={item.internalLinks}
                        header={item.contentBody}
                        footerLink={item.link}
                        footerContent={item.body}
                        footerLinkTitle={item.title}
                      />
                    )}
                  </React.Fragment>
                );
              case 'card':
              default:
                return (
                  <React.Fragment key={index}>
                    <a target="_blank" href={item.link} rel="noreferrer">
                      <Card>
                        <CardTitle>
                          {item.title}
                          <OpenInNewIcon
                            fontSize="inherit"
                            style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.875rem' }}
                          />
                        </CardTitle>
                        <CardBody>{item.body}</CardBody>
                      </Card>
                    </a>
                  </React.Fragment>
                );
            }
          })}
        </HelpCenterContent>

        {contentData.some((item) => item.footer) && (
          <FooterWrapper>
            <HelpCenterFooter>
              <a href="https://forum.akash.network/" target="_blank" rel="noreferrer">
                <FooterEntry>Akash Forum</FooterEntry>
              </a>
              <a href="https://docs.akash.network/" target="_blank" rel="noreferrer">
                <FooterEntry>Akash Docs</FooterEntry>
              </a>
              <a href="https://discord.akash.network/" target="_blank" rel="noreferrer">
                <FooterEntry>Akash Discord</FooterEntry>
              </a>
              <a href="https://akash.network/community/" target="_blank" rel="noreferrer">
                <FooterEntry>Contact Us</FooterEntry>
              </a>
            </HelpCenterFooter>
          </FooterWrapper>
        )}
      </HelpCenterWrapper>
    </>
  );
};
