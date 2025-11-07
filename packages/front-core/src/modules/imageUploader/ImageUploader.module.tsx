import React, { useCallback } from 'react';
import ImageUploader, { ImageUploaderContext } from './ImageUploader';

export interface ImageUploaderModuleProps {
  onClose: () => void;
  context: ImageUploaderContext;
  entityId: number;
  width: number;
  height: number;
}

const ImageUploaderModule = ({
  onClose,
  context,
  entityId,
  width,
  height,
}: ImageUploaderModuleProps) => {
  const [open, setOpen] = React.useState(true);

  const internalOnClose = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);
  const onSuccess = useCallback(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.reload();
    } else {
      alert('Image created !');
    }
  }, [])

  return <ImageUploader 
      open={open}
      onClose={internalOnClose}
      onSuccess={onSuccess}
      context={context}
      entityId={entityId}
      width={width}
      height={height}
    />
};

export default ImageUploaderModule;
