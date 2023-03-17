import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  styled,
} from '@mui/material';
import React from 'react';

export interface UploadButtonProps
  extends Pick<React.InputHTMLAttributes<{}>, 'accept' | 'multiple'>,
    Omit<ButtonProps, 'component' | 'onChange'> {
  loading?: boolean;
  onChange: (fileList: FileList | null) => void;
}

let uniqueId = 0;
const getId = () => {
  uniqueId += 1;
  return uniqueId;
};

const HiddenInput = styled('input')(() => ({
  display: 'none',
}));

const UploadButton = ({
  accept,
  multiple,
  loading = true,
  onChange,
  children,
  ...buttonProps
}: UploadButtonProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = getId();

  /** */
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  /** */
  return (
    <Box
      sx={{
        '& > *': {
          m: 1,
        },
      }}
    >
      <label htmlFor={`upload-button$-${id}`}>
        <Button {...buttonProps} component="span">
          {loading ? <CircularProgress size={24} /> : children}
        </Button>
        <HiddenInput
          ref={inputRef}
          id={`upload-button$-${id}`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
        />
      </label>
    </Box>
  );
};

export default UploadButton;
