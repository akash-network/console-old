import React, { useMemo } from 'react';
import { Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Address } from '../Address';
import { queryProviderInfo } from '../../api/queries';
import { useQuery } from 'react-query';

export interface ProviderDetailsProps {
  providerId: string;
}

function attributeByName(attributes: any) {
  return function AttributeByName(key: string) {
    return attributes[key] !== 'undefined' ? attributes[key] : <span>not found</span>;
  };
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ providerId }) => {
  const navigate = useNavigate();
  const { data: response } = useQuery(['providerInfo', providerId], queryProviderInfo);
  const provider = response?.provider;

  const attributes = useMemo(
    () =>
      provider?.attributes
        ? Object.fromEntries(
          provider.attributes.map((attr) => [attr.key.toLowerCase(), attr.value])
        )
        : null,
    [provider]
  );

  const AttributeValue = useMemo(() => {
    const attrValue = attributeByName(attributes);
    const AttributeValue = ({ name }: { name: string }) => <span>{attrValue(name)}</span>;

    return AttributeValue;
  }, [attributes]);

  const goBack = () => navigate(-1);

  if (!provider || !attributes) {
    return <></>;
  }

  return (
    <Grid container spacing={5}>
      {/* Header */}
      <Grid item xs={14}>
        <Heading>
          <ReturnArrow onClick={goBack} /> Back to All Providers
        </Heading>
      </Grid>

      {/* Summary panel */}
      <Grid item xs={4}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <ProviderName>{provider.hostUri}</ProviderName>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Header>Info</Header>
                <Field label="Region">
                  <AttributeValue name="region" />
                </Field>
                <Field label="Address">
                  <Address address={provider.owner} />
                </Field>
                <Field label="Organization">
                  <AttributeValue name="organization" />
                </Field>
              </Stack>
              <Stack spacing={1}>
                <Header>Contact</Header>
                <Field label="Website">
                  <AttributeValue name="website" />
                </Field>
                <Field label="Email">
                  <AttributeValue name="email" />
                </Field>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Main detail panel */}
      <Grid item xs={8}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <AttributeHeader>Attributes</AttributeHeader>
              <Divider />
              <Stack>
                {Object.entries(attributes).map(([key, value]) => (
                  <Attribute label={key} key={key}>
                    {value}
                  </Attribute>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProviderDetails;

const ReturnArrow = (props: any) => (
  <Button {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 19L3 12M3 12L10 5M3 12L21 12"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <FieldContainer>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="#6B7280">{label}:</Typography>
        {children}
      </Stack>
    </FieldContainer>
  );
};

const Attribute = ({ label, children }: { label: string; children: any }) => {
  return (
    <AttributeContainer>
      <Stack direction="row">
        <Typography width="18rem">{label[0].toUpperCase() + label.slice(1)}:</Typography>
        {children}
      </Stack>
    </AttributeContainer>
  );
};

const FieldContainer = styled.div`
  padding: 9px 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
`;

const AttributeContainer = styled.div`
  padding: 9px 13px;
`;

const Heading = styled.h1`
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #111827;
  padding-bottom: 28px;
  border-bottom: 1px solid #e5e7eb;
`;

const ProviderName = styled.h2`
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipse;
`;

const Header = styled.h3`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #374151;
`;

const AttributeHeader = styled.h2`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #111827;
  margin-bottom: 8px;
`;
