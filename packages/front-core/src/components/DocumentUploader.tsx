import { Catalog, EntityFile, Group, useCreateDocumentMutation, Vendor } from '@gql';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Stub } from '@utils/gql';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import React from 'react';
import { encodeFileToBase64String } from '../utils/encoding';
import DropzoneArea from './utils/DropzoneArea/DropzoneArea';
import ApolloErrorAlert from './utils/errors/ApolloErrorAlert';

export type DocumentVisibility = 'members' | 'public' | 'subscribers';

interface DocumentUploaderProps {
  entity: Stub<Vendor | Group | Catalog>;
  onSuccess?: (document: EntityFile) => void;
  onError?: (error: Error) => void;
}

function DocumentUploader({ entity, onSuccess, onError }: DocumentUploaderProps) {

  const { t, tt, tdu } = useCamapTranslation({ t: "translation", tt: "upload/common", tdu : "upload/document-uploader" })

  const [file, setFile] = React.useState<File | null>(null);
  const [documentName, setDocumentName] = React.useState<string>('');
  const [visibility, setVisibility] = React.useState<DocumentVisibility>('members');
  const [error, setError] = React.useState<string | null>(null);

  const [createDocument, { loading, error: mutationError }] = useCreateDocumentMutation();

  // Determine entity type and available visibility options
  const entityType = React.useMemo(() => {
    if (entity.__typename === 'Group') return 'group';
    if (entity.__typename === 'Catalog') return 'catalog';
    if (entity.__typename === 'Vendor') return 'vendor';
    return null;
  }, [entity]);

  const visibilityOptions = React.useMemo(() => {
    const options: { value: DocumentVisibility; label: string }[] = [];
    
    if (entityType === 'vendor') {
      options.push({ value: 'public', label: t('documentVisibility-public') });
    } else if (entityType === 'catalog') {
      options.push({ value: 'subscribers', label: t('documentVisibility-subscribers') });
      options.push({ value: 'members', label: t('documentVisibility-members') });
      options.push({ value: 'public', label: t('documentVisibility-public') });
    } else if (entityType === 'group') {
      options.push({ value: 'members', label: t('documentVisibility-members') });
      options.push({ value: 'public', label: t('documentVisibility-public') });
    }
    
    return options;
  }, [entityType, t]);

  // Default visibility based on entity type
  React.useEffect(() => {
    if (entityType === 'catalog') {
      setVisibility('subscribers');
    } else if (entityType === 'group') {
      setVisibility('members');
    } else if (entityType === 'vendor') {
      setVisibility('public');
    }
  }, [entityType]);

  const handleFileDrop = React.useCallback((files: File[]) => {
    if (files.length !== 1) return;
    
    const droppedFile = files[0];
    
    // Validate PDF
    if (!droppedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Le document n\'est pas au format pdf. Veuillez sélectionner un fichier au format pdf.');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (droppedFile.size > maxSize) {
      setError('Le document importé est trop volumineux. Il ne doit pas dépasser 10 Mo.');
      return;
    }
    
    setFile(droppedFile);
    setDocumentName(droppedFile.name.split('.').slice(0,-1).join('-'));
    setError(null);
  }, []);

  const handleUpload = React.useCallback(async () => {
    if (!file || !entityType) return;
    
    setError(null);
    
    try {
      // Encode file to base64
      const base64Encoded = await encodeFileToBase64String(file);
      
      // Prepare base64 data URI
      const base64DataUri = `data:application/pdf;base64,${base64Encoded}`;
      
      // Get the entity ID (handling both string and number types)
      const entityId = typeof entity.id === 'string' ? parseInt(entity.id, 10) : entity.id;
      
      // Call mutation
      const result = await createDocument({
        variables: {
          entityType,
          entityId,
          base64EncodedFile: base64DataUri,
          fileName: file.name,
          name: documentName || file.name,
          visibility,
        },
      });
      
      if (result.data?.createDocument) {
        onSuccess?.(result.data.createDocument);
        // Reset form after success
        setFile(null);
        setDocumentName('');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'upload du document.';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [file, entityType, documentName, visibility, entity.id, createDocument, onSuccess, onError]);

  const handleReset = React.useCallback(() => {
    setFile(null);
    setDocumentName('');
    setError(null);
  }, []);

  if (!entityType) {
    throw new Error('unknown entity type, cannot upload file')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {mutationError && <ApolloErrorAlert error={mutationError} />}
      {error && !mutationError && (
        <Alert severity="error">{error}</Alert>
      )}
      
      {!file ? (
        <DropzoneArea
          filesLimit={1}
          acceptedFiles={['application/pdf']}
          dropzoneText={tdu("dropZoneTitle")}
          maxFileSize={10 * 1024 * 1024} // 10MB
          getDropRejectMessage={(rejectedFile, _, maxFileSize) => {
            if(rejectedFile.size > maxFileSize)
              return tdu("rejectionSize", { maxSize: tt("fileSize", {sizeMb: maxFileSize / (1024*1024)})});
            return tdu("rejectionFormat");
          }}
          onChange={handleFileDrop}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, m: 2 }}>
          <Typography variant="body1">
            {tt("selectedFile")}
            {tt("fileNameWithSize", {
              fileName: file.name,
              fileSize: tt("fileSize", { sizeMb: (file.size / (1024*1024)).toFixed(2) })
            })}
          </Typography>
          
          <TextField
            label={tdu("documentNameTitle")}
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            fullWidth
          />
          
          <FormControl fullWidth>
            <InputLabel>{tdu("documentVisibility")}</InputLabel>
            <Select
              value={visibility}
              label={tdu("documentVisibility")}
              onChange={(e) => setVisibility(e.target.value as DocumentVisibility)}
            >
              {visibilityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <LoadingButton
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              {tt("backButton")}
            </LoadingButton>
            <LoadingButton
              variant="contained"
              onClick={handleUpload}
              loading={loading}
              disabled={!file || !documentName.trim()}
            >
              {tt("uploadButton")}
            </LoadingButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default DocumentUploader;