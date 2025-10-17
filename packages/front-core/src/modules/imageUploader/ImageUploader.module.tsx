import { RotateLeft, RotateRight } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Typography,
} from '@mui/material';
import imageCompression from 'browser-image-compression';
import React from 'react';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import DropzoneArea from '../../components/utils/DropzoneArea/DropzoneArea';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import {
  useSetGroupImageMutation,
  useSetProductImageMutation,
  useSetVendorImageMutation,
} from '../../gql';
import { encodeFileToBase64String } from '../../utils/encoding';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { getBase64EncodedImage } from '../../utils/image';

export enum ImageUploaderContext {
  GROUP = 'group',
  PRODUCT = 'product',
  VENDOR = 'vendor',
}

const DEFAULT_CONTAINER_SIZE = 500;

export interface ImageUploaderModuleProps {
  onClose: () => void;
  context: ImageUploaderContext;
  entityId: number;
  width: number;
  height: number;
  imageType?: string;
}

const createImage = (base64EncodedImage: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = base64EncodedImage;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
async function getCroppedAndRotatedImage(
  base64: string,
  croppedArea: Area,
  mimeType: string,
  rotation: number,
): Promise<string> {
  const image = await createImage(base64);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get context from canvas');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = croppedArea.width;
  canvas.height = croppedArea.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - croppedArea.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - croppedArea.y),
  );

  // Return as Base64 string
  return canvas.toDataURL(mimeType);
}

const ImageUploaderModule = ({
  onClose,
  context,
  entityId,
  width,
  height,
  imageType,
}: ImageUploaderModuleProps) => {
  const { t } = useCamapTranslation({
    tImageUploader: 'imageUploader',
  });

  const [open, setOpen] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File>();
  const [zoom, setScale] = React.useState<number>(1);
  const [crop, setPosition] = React.useState<Point>({ x: 0.5, y: 0.5 });
  const [rotation, setRotate] = React.useState<number>(0);
  const [base64, setBase64] = React.useState<string>();
  const [croppedArea, setCroppedArea] = React.useState<Area>();
  const [loading, setLoading] = React.useState(false);

  const [setProductImageMutation, { data: productData, error: productError }] =
    useSetProductImageMutation();
  const [setGroupImageMutation, { data: groupData, error: groupError }] =
    useSetGroupImageMutation();
  const [setVendorImageMutation, { data: vendorData, error: vendorError }] =
    useSetVendorImageMutation();

  const data = groupData || productData || vendorData;
  const error = groupError || productError || vendorError;

  React.useEffect(() => {
    if (!data && !error) return;

    setLoading(false);

    if (error) return;

    // Reload window
    setOpen(false);
    if (process.env.NODE_ENV === 'production') {
      window.location.reload();
    } else {
      alert('Image created !');
    }
  }, [data, error]);

  React.useEffect(() => {
    if (!imageFile) return;
    const encode = async () => {
      const e = await encodeFileToBase64String(imageFile);
      setBase64(e);
      setLoading(false);
    };
    encode();
  }, [imageFile]);

  const onFileLoad = async (files: File[]) => {
    if (files.length !== 1) return;
    setLoading(true);
    const file = files[0];

    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: Math.min(width, height) * 3,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    setImageFile(compressedFile);
  };

  const onCropChange = (position: Point) => setPosition(position);

  const updateScale = (_: any, newScale: number | number[]) => {
    setScale(Array.isArray(newScale) ? newScale[0] : newScale);
  };

  const rotateLeft = () => {
    setRotate(rotation - 90);
  };

  const rotateRight = () => {
    setRotate(rotation + 90);
  };

  const onCropComplete = React.useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);
    },
    [],
  );

  const uploadImage = async () => {
    if (!imageFile || !base64 || !croppedArea) return;
    setLoading(true);
    try {
      const transformedImage = await getCroppedAndRotatedImage(
        getBase64EncodedImage(base64, imageFile.type),
        croppedArea,
        imageFile.type,
        rotation,
      );

      const otherVariables = {
        base64EncodedImage: transformedImage,
        mimeType: imageFile.type,
        fileName: imageFile.name,
        maxWidth: width,
      };
      switch (context) {
        case ImageUploaderContext.PRODUCT:
          setProductImageMutation({
            variables: {
              productId: entityId,
              ...otherVariables,
            },
          });
          break;
        case ImageUploaderContext.GROUP:
          setGroupImageMutation({
            variables: {
              groupId: entityId,
              ...otherVariables,
            },
          });
          break;
        case ImageUploaderContext.VENDOR:
          setVendorImageMutation({
            variables: {
              vendorId: entityId,
              ...otherVariables,
            },
          });
          break;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const onReset = () => {
    setImageFile(undefined);
    setBase64(undefined);
    setScale(1);
    setRotate(0);
    setPosition({ x: 0.5, y: 0.5 });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="image-uploader-dialog-title"
      fullWidth
    >
      <DialogTitle id="image-uploader-dialog-title">
        <Typography variant="h3">{t('addAnImage')}</Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Box p={2}>
            <ApolloErrorAlert error={error} />
          </Box>
        )}
        {!imageFile && !loading ? (
          <DropzoneArea
            filesLimit={1}
            acceptedFiles={['image/*']}
            dropzoneText={t('dropYourImageHere')}
            maxFileSize={25000000}
            getDropRejectMessage={(
              rejectedFile: File,
              _,
              maxFileSize: number,
            ) =>
              t('dropReject', {
                fileName: rejectedFile.name,
                maxFileSize: maxFileSize / 1000000,
              })
            }
            onChange={onFileLoad}
          />
        ) : (
          <>
            {base64 && imageFile ? (
              <>
                <Box display="flex" justifyContent="center">
                  <Box
                    width={DEFAULT_CONTAINER_SIZE}
                    height={DEFAULT_CONTAINER_SIZE}
                    position="relative"
                  >
                    <Cropper
                      image={getBase64EncodedImage(base64, imageFile.type)}
                      rotation={rotation}
                      zoom={zoom}
                      crop={crop}
                      aspect={width / height}
                      onCropChange={onCropChange}
                      onCropComplete={onCropComplete}
                    />
                  </Box>
                </Box>
                <Box mt={2} display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={onReset}
                    disabled={loading}
                  >
                    {t('chooseAnotherFile')}
                  </Button>
                </Box>
                <Box m={2}>
                  <Box display="flex" flexDirection="row" mb={2}>
                    <Box mr={2}>
                      <Typography component="span">{t('zoom')}</Typography>
                    </Box>
                    <Box flexGrow={1}>
                      <Slider
                        value={zoom}
                        onChange={updateScale}
                        min={1}
                        max={2}
                        step={0.01}
                      />
                    </Box>
                    <Box ml={2}>
                      <Typography component="span">
                        {Math.round(zoom * 100)} %
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Button
                      variant="outlined"
                      onClick={rotateLeft}
                      startIcon={<RotateLeft />}
                      disabled={loading}
                    >
                      {t('left')}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={rotateRight}
                      startIcon={<RotateRight />}
                      disabled={loading}
                    >
                      {t('right')}
                    </Button>
                    <LoadingButton
                      variant={'contained'}
                      color={'primary'}
                      onClick={uploadImage}
                      className="upload-button"
                      loading={loading}
                    >
                      {t('send')}
                    </LoadingButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                height={DEFAULT_CONTAINER_SIZE}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default ImageUploaderModule;
