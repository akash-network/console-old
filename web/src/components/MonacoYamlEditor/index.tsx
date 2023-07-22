import { editor, Uri } from 'monaco-editor';
import styled from '@emotion/styled';
import React, { useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { setDiagnosticsOptions } from 'monaco-yaml';
import yaml, { YAMLException } from 'js-yaml';
import ArrowRight from '../../assets/images/icon-right.svg';
import { isSDLSpec, SDLSpec } from '../SdlConfiguration/settings';
import logging from '../../logging';

// The uri is used for the schema file match.
const modelUri = Uri.parse('a://b/foo.yaml');

interface MonacoYamlEditorProps {
  value: string;
  open: boolean;
  appName?: string;
  closeReviewModal: () => void;
  onSaveButtonClick: (value: SDLSpec) => void;
  disabled: boolean;
  onSave: (sdl: any) => void; // Add onSave prop
}

export const MonacoYamlEditor: React.FC<MonacoYamlEditorProps> = ({
  value,
  open,
  appName,
  closeReviewModal,
  onSaveButtonClick,
  disabled,
}) => {
  const comment = '#Copy and paste your SDL here';
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorEmpty, setIsEditorEmpty] = React.useState(true);

  setDiagnosticsOptions({
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    validate: true,
    format: true,
  });

  function handleInput() {
    setIsEditorEmpty(false);
  }

  useEffect(() => {
    if (open && document.getElementById('editor')) {
      const existingModel = editor.getModel(modelUri);
      // If value is empty it will be "{}\n" and we will show the comment to the user to paste the value
      const valueToShow = value === '{}\n' ? comment : value;

      if (existingModel) {
        existingModel.setValue(valueToShow);
        // readOnly is not officially supported by updateOptions
        // but seems to work, so... ¯\_(ツ)_/¯
        existingModel.updateOptions({ readOnly: disabled } as any);
      }

      const model = existingModel || editor.createModel(valueToShow, 'yaml', modelUri);

      if (editorRef.current) {
        editor.create(editorRef.current, {
          automaticLayout: true,
          model: model,
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false,
          },
          readOnly: disabled,
          theme: 'vs-dark',
        });
      }
    }
  }, [open, value]);

  return (
    <EditorDialog
      keepMounted
      open={open}
      onClose={closeReviewModal}
      onInput={handleInput}
      onPaste={handleInput}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          bgcolor: '#272727',
          color: 'white',
          borderBottom: '1px solid #858A92',
          fontSize: 0,
          display: 'flex',
        }}
      >
        {appName && <DialogTitleText>{appName}</DialogTitleText>}
        <DialogTitleReview>
          {appName && <img src={ArrowRight} alt="Icon Right" />}
          <DialogSubtitleText>Review SDL</DialogSubtitleText>
        </DialogTitleReview>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Editor id="editor" ref={editorRef} />
      </DialogContent>
      <DialogActions
        sx={{
          bgcolor: '#272727',
          borderTop: '1px solid #858A92',
          padding: '20px 10px',
        }}
      >
        {!disabled && (
          <SaveAndCloseButton
            variant="outlined"
            size="small"
            onClick={() => {
              closeReviewModal();
              setIsEditorEmpty(true);
            }}
          >
            Cancel
          </SaveAndCloseButton>
        )}

        {!isEditorEmpty && (
          <SaveAndCloseButton
            variant="outlined"
            size="small"
            onClick={() => {
              if (disabled) {
                return false;
              }

              try {
                const valueFromEditor = editor.getModel(modelUri)?.getValue();

                if (valueFromEditor === undefined) {
                  logging.error(
                    'Unable to get SDL value from form. Please return to the previous page and try again.'
                  );
                  return false;
                }

                const sdl: unknown = yaml.load(valueFromEditor);

                if (isSDLSpec(sdl)) {
                  onSaveButtonClick(sdl);
                  closeReviewModal();
                } else {
                  logging.error('SDL is invalid. Please check the SDL and try again.');
                }
              } catch (e: unknown) {
                logging.error(`Cannot parse SDL: ${(e as YAMLException).message}}`);
              }
            }}
          >
            {disabled ? 'Close' : 'Save & Close'}
          </SaveAndCloseButton>
        )}
      </DialogActions>
    </EditorDialog>
  );
};

const EditorDialog = styled(Dialog)``;

const Editor = styled.div`
  width: 60vw;
  height: 60vh;
  background: #272727;
  box-shadow: 0px 20px 64px 20px rgba(20, 20, 27, 0.25);
`;

const SaveAndCloseButton = styled(Button)`
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 16px;
  padding: 5px 20px;
  color: #374151;
  text-transform: capitalize;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #d7d7d7;
  border-radius: 6px;

  &:hover {
    background-color: #f4f5f8;
    border-color: #e1d9d9;
  }
`;

const DialogTitleText = styled.span`
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 16px;
  padding: 4px 8px;
  background: #858a92;
  border-radius: 6px;
`;

const DialogSubtitleText = styled.span`
  font-family: 'Satoshi-Medium', sans-serif;
  font-size: 16px;
  color: #7c8085;
  padding-left: 8px;
`;

const DialogTitleReview = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
`;
