import React from 'react';
import { Field } from 'formik';
import { MonacoYamlEditor } from '../MonacoYamlEditor';
import yaml from 'js-yaml';
import { FieldWrapper } from './styling';

interface SdlEditorProps {
  reviewSdl: boolean;
  closeReviewModal: () => void;
  disabled?: boolean;
  callback?: (sdl: any) => void;
  onSave: (sdl: any) => void;
}

export const SdlEditor: React.FC<SdlEditorProps> = ({
  reviewSdl,
  closeReviewModal,
  disabled,
  callback,
  onSave, // Add the onSave prop
}) => {
  return (
    <FieldWrapper>
      <Field name={'sdl'}>
        {({ field, form }: any) => {
          return (
            <MonacoYamlEditor
              // This option in dump is needed cause some ENV can have more than default of 80 characters
              // In that cause, dump will cut the line with >- character
              // Here we tell the dump function than line can have up to 200 characters
              value={yaml.dump(field.value, { lineWidth: 200 })}
              appName={form.values?.appName}
              open={reviewSdl}
              disabled={Boolean(disabled)}
              closeReviewModal={closeReviewModal}
              onSaveButtonClick={(value) => {
                if (callback) {
                  return callback(value);
                }

                if (onSave) {
                  return onSave(value);
                }
                form.setFieldValue(field.name, value);
              }}
              onSave={onSave}
            />
          );
        }}
      </Field>
    </FieldWrapper>
  );
};
