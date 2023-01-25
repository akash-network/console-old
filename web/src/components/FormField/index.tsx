import React from 'react';
import { TextField } from '@mui/material';

export interface FormFieldProps {
  label: string;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, placeholder } = props;
  const inputStyle = { width: 378, height: 38, marginLeft: 0 };
  return (
    <div className="flex-1">
      <div className="text-md font-medium">{label}</div>
      <TextField size="small" placeholder={placeholder} style={inputStyle} />
    </div>
  );
};
