import AttachFile from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import { FileObjectType } from './DropzoneArea';

interface PreviewListProps {
  fileObjects: FileObjectType[];
  handleRemove: (index: number) => void;
}

// function isImage(file: File) {
//   if (file.type.split('/')[0] === 'image') {
//     return true;
//   }
//   return false;
// }

const ImageSx = {
  height: 100,
  width: 'initial',
  maxWidth: '100%',
  color: 'text.primary',
  transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
  boxSizing: 'border-box',
  boxShadow: 'rgba(0, 0, 0, 0.12) 0 1px 6px, rgba(0, 0, 0, 0.12) 0 1px 4px',
  borderRadius: 1,
  zIndex: 5,
  opacity: 1,
};

// code supprimé car pas de sens et n'est pas réellement utilisé
// const StyledImd = styled('img')((() => ImageSx));

const getPreviewIcon = (fileObject: FileObjectType) => {
  // if (isImage(fileObject.file)) {
  //   return (
  //     <StyledImd role="presentation" src={fileObject.data} alt="preview" />
  //   );
  // }

  return <AttachFile sx={ImageSx} />;
};

const PreviewList = ({ fileObjects, handleRemove }: PreviewListProps) => {
  return (
    <Grid spacing={8} container={true}>
      {fileObjects.map((fileObject, i) => {
        return (
          <Grid
            xs={4}
            item={true}
            key={`${fileObject.file?.name ?? 'file'}-${i}`}
            sx={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              '&:hover $image': {
                opacity: 0.3,
              },
              '&:hover $removeButton': {
                opacity: 1,
              },
            }}
          >
            {getPreviewIcon(fileObject)}

            <Fab
              onClick={() => handleRemove(i)}
              aria-label="Delete"
              sx={{
                transition: '.5s ease',
                position: 'absolute',
                opacity: 0,
                top: -1,
                right: -1,
                width: 40,
                height: 40,
                '&:focus': {
                  opacity: 1,
                },
              }}
            >
              <DeleteIcon />
            </Fab>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PreviewList;
