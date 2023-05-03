import { Field } from 'formik';
import React from 'react';
import styled from '@emotion/styled';
import { ErrorMessageComponent } from '../ErrorMessage';
import { FieldWrapper, Input } from './styling';

const validateImage = (value: any) => {
  let error;
  if (!value) {
    error = 'Image can"t be empty, you have to add app image to make deployment work';
  }
  return error;
};

type ImageProps = {
  currentProfile: string;
};

export const Image: React.FC<ImageProps> = ({ currentProfile }) => {
  return (
    <Field name={`sdl.services.${currentProfile}.image`} validate={validateImage} id="image">
      {({ field, meta }: any) => (
        <FieldWrapperImage>
          <InputField error={meta?.error} type="text" {...field} />
          {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
        </FieldWrapperImage>
      )}
    </Field>
  );
};

const FieldWrapperImage = styled(FieldWrapper)`
  display: flex;
  align-items: start;
  flex-direction: column;
`;

const InputField = styled(Input)<{ error?: boolean }>`
  width: 100%;

  &:focus {
    border-color: red;
    outline: 0 none;
  }
`;
