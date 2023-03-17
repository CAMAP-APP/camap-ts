import { CloudUpload } from '@mui/icons-material';
import { Alert, Box, Typography } from '@mui/material';
import * as React from 'react';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import theme from '../../../theme';
import PreviewList from './PreviewList';

export type FileObjectType = {
  file: File;
  data: any;
};

const DEFAULT_DROPZONEAREA_MAX_FILE_SIZE = 3000000;

export function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event?.target?.result);
    };
    reader.onerror = (event) => {
      reader.abort();
      reject(event);
    };
    reader.readAsDataURL(file);
  });
}

interface DropzoneAreaProps {
  /** A list of file types to accept.
   * @see See [here](https://react-dropzone.js.org/#section-accepting-specific-file-types) for more details.
   */
  acceptedFiles?: Array<string>;

  /** Maximum number of files that can be loaded into the dropzone. */
  filesLimit?: number;

  /** Maximum file size (in bytes) that the dropzone will accept. */
  maxFileSize?: number;

  /** Text inside the dropzone. */
  dropzoneText: string;

  /**
   * Get alert message to display when a file is rejected onDrop.
   *
   * *Default*: "File ${rejectedFile.name} was rejected."
   *
   * @param {Object} rejectedFile The file that got rejected
   * @param {string[]} acceptedFiles The `acceptedFiles` prop currently set for the component
   * @param {number} maxFileSize The `maxFileSize` prop currently set for the component
   */
  getDropRejectMessage: (
    rejectedFile: File,
    acceptedFiles: string[],
    maxFileSize: number,
  ) => string;

  /**
   * Fired when the files inside dropzone change.
   *
   * @param {File[]} loadedFiles All the files currently loaded into the dropzone.
   */
  onChange: (loadedFiles: File[]) => void;
}

/**
 * This components creates a Material-UI Dropzone, with previews and snackbar notifications.
 */
const DropzoneArea = ({
  acceptedFiles = [],
  dropzoneText,
  filesLimit = 3,
  getDropRejectMessage,
  maxFileSize = DEFAULT_DROPZONEAREA_MAX_FILE_SIZE,
  onChange,
}: DropzoneAreaProps) => {
  const [fileObjects, setFileObjects] = React.useState<
    { file: any; data: any }[]
  >([]);
  const [rejectedFiles, setRejectedFiles] = React.useState<File[]>();

  React.useEffect(() => {
    return () => {
      setFileObjects([]);
    };
  }, []);

  React.useEffect(() => {
    onChange(fileObjects.map((fileObject) => fileObject.file));
  }, [fileObjects]);

  const handleDropAccepted = async (acceptedFiles: File[], _: DropEvent) => {
    // Retrieve fileObjects data
    const fileObjs = await Promise.all(
      acceptedFiles.map(async (file) => {
        const data = await readFile(file);
        return {
          file,
          data,
        };
      }),
    );

    // Notify added files
    if (filesLimit <= 1) {
      setFileObjects([fileObjs[0]]);
    } else {
      setFileObjects(fileObjects.concat(fileObjs));
    }
  };

  const handleDropRejected = (
    newRejectedFiles: FileRejection[],
    _: DropEvent,
  ) => {
    setRejectedFiles(newRejectedFiles.map((fr) => fr.file));
  };

  const handleRemove = (fileIndex: number) => {
    // Calculate remaining fileObjects array
    const remainingFileObjs = fileObjects.filter((_, i) => {
      return i !== fileIndex;
    });

    // Update local state
    setFileObjects(remainingFileObjs);
  };

  const acceptFiles = acceptedFiles?.join(',');
  const isMultiple = filesLimit > 1;
  const previewsInDropzoneVisible = fileObjects.length > 0;

  return (
    <>
      {rejectedFiles &&
        rejectedFiles.length > 0 &&
        rejectedFiles.map((rejectedFile) => (
          <Box mb={1}>
            <Alert severity="error">
              {getDropRejectMessage(
                rejectedFile,
                acceptedFiles || [],
                maxFileSize,
              )}
            </Alert>
          </Box>
        ))}

      <Dropzone
        accept={acceptFiles}
        onDropAccepted={handleDropAccepted}
        onDropRejected={handleDropRejected}
        maxSize={maxFileSize}
        multiple={isMultiple}
      >
        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
          <div
            {...getRootProps({
              style: {
                position: 'relative',
                width: '100%',
                minHeight: '250px',
                backgroundColor: theme.palette.background.paper,
                border: 'dashed',
                borderColor: theme.palette.divider,
                borderRadius: theme.shape.borderRadius,
                boxSizing: 'border-box',
                cursor: 'pointer',
                overflow: 'hidden',
                '@keyframes progress': {
                  '0%': {
                    backgroundPosition: '0 0',
                  },
                  '100%': {
                    backgroundPosition: '-70px 0',
                  },
                },

                ...(isDragActive && {
                  animation: '$progress 2s linear infinite !important',
                  // eslint-disable-next-line max-len
                  backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.background.paper}, ${theme.palette.background.paper} 25px, ${theme.palette.divider} 25px, ${theme.palette.divider} 50px)`,
                  backgroundSize: '150% 100%',
                  border: 'solid',
                  borderColor: 'primary.light',
                }),

                ...(isDragReject && {
                  // eslint-disable-next-line max-len
                  backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.error.light}, ${theme.palette.error.light} 25px, ${theme.palette.error.dark} 25px, ${theme.palette.error.dark} 50px)`,
                  borderColor: 'error.main',
                }),
              },
            })}
          >
            <input {...getInputProps()} />

            <Box textAlign="center">
              <Typography
                variant="h5"
                component="p"
                sx={{ mb: 3, mt: 3, fontSize: '1.5rem' }}
              >
                {dropzoneText}
              </Typography>
              <CloudUpload
                sx={{
                  width: 51,
                  height: 51,
                  color: 'text.primary',
                }}
              />
            </Box>

            {previewsInDropzoneVisible && (
              <PreviewList
                fileObjects={fileObjects}
                handleRemove={handleRemove}
              />
            )}
          </div>
        )}
      </Dropzone>
    </>
  );
};

export default DropzoneArea;
