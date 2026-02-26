import { Catalog, useGetActiveCatalogsPicturesLazyQuery, Vendor } from '@gql';
import {
  Autocomplete,
  Box,
  CircularProgress,
  ListItem,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { AutocompleteChangeReason } from '@mui/material/useAutocomplete';
import { logError } from '@utils/logger';
import imageCompression from 'browser-image-compression';
import React, { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorRef } from '@platejs/core/react';
import { insertImage, insertImageFromFiles } from '@platejs/media';
import CamapIcon, { CamapIconId } from '@components/utils/CamapIcon';
import { getCamapHost } from 'lib/runtimeCfg';
import { TextEditorToolbarButton } from './TextEditorToolbarButton';
import type { MessageEditor } from '../platePlugins';

type CatalogType = Pick<Catalog, 'id'> & {
  vendor: Pick<Vendor, 'name' | 'id' | 'image'>;
};

interface InsertImageButtonProps {
  onAddImagesCustomHandle?: (image: File[]) => void;
  groupId?: number;
}

const MessageImageButton = ({ groupId, onAddImagesCustomHandle }: InsertImageButtonProps) => {
  const { t } = useTranslation(['messages/default']);
  const [getActiveCatalogs, { data: activeContractsData }] =
    useGetActiveCatalogsPicturesLazyQuery();
  const editor = useEditorRef<MessageEditor>();
  const imageInput = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isActive, setIsActive] = React.useState(false);
  const [catalogValue, setCatalogValue] = React.useState<CatalogType | undefined>(undefined);
  const [catalogInputValue, setCatalogInputValue] = React.useState('');

  React.useEffect(() => {
    if (!groupId) return;
    getActiveCatalogs({ variables: { groupId } });
  }, [getActiveCatalogs, groupId]);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setIsActive(true);
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setIsActive(false);
  };

  const openUploadImageInput = () => {
    if (!imageInput.current) return;
    closeMenu();
    imageInput.current.value = '';
    imageInput.current.click();
  };

  const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (groupId) openMenu(event);
    else openUploadImageInput();
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setLoading(true);
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';
    const files = event.target.files;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 500,
      useWebWorker: true,
    };

    try {
      insertImageFromFiles(editor, files);

      const compressedFiles = await Promise.all(
        Array.from(files).map(
          (file) => imageCompression(file, options)
        )
      );
      onAddImagesCustomHandle?.(compressedFiles);
    } catch (error) {
      logError(error);
    } finally {
      setLoading(false);
      document.body.style.cursor = previousCursor;
    }
  };

  const onCatalogSelected = (
    _event: SyntheticEvent,
    newValue: CatalogType | null,
    reason: AutocompleteChangeReason,
  ) => {
    if (reason === 'blur' || reason === 'clear') {
      setCatalogValue(undefined);
      setCatalogInputValue('');
      return;
    }
    if (!newValue) return;
    closeMenu();

    const image = newValue.vendor?.image as string;
    void `${getCamapHost()}${image}`;
    // insertMessageImage(editor, { url, filename: undefined });
  };

  const catalogsWithImage =
    activeContractsData?.getActiveCatalogs?.filter((c) => !!c.vendor?.image);

  return (
    <TextEditorToolbarButton
      active={isActive}
      onMouseDown={onMouseDown}
      aria-controls="message-image-upload-menu"
      aria-haspopup="true"
    >
      {loading ? (
        <CircularProgress size={24 - 3.6} />
      ) : (
        <CamapIcon id={CamapIconId.image} sx={{ display: 'block', fontSize: '1.71rem', alignSelf: 'center' }} />
      )}
      {groupId && (
        <Menu
          id="message-image-upload-menu"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={closeMenu}
        >
          <MenuItem onClick={openUploadImageInput} sx={{ height: '56px', paddingLeft: '30px' }}>
            {t('form.fromDevice')}
          </MenuItem>
          {catalogsWithImage && (
            <ListItem>
              <Autocomplete
                options={catalogsWithImage as any}
                getOptionLabel={(option: any) => option?.vendor?.name ?? ''}
                renderInput={(params) => (
                  <TextField {...params} label={t('form.fromCatalog')} variant="outlined" />
                )}
                autoSelect
                autoHighlight
                fullWidth
                style={{ width: 300 }}
                clearOnEscape
                clearOnBlur
                value={catalogValue as any}
                onChange={onCatalogSelected}
                inputValue={catalogInputValue}
                onInputChange={(_, v) => setCatalogInputValue(v)}
              />
            </ListItem>
          )}
        </Menu>
      )}
      <Box display="none">
        <input type="file" accept="image/*" ref={imageInput} onChange={uploadImage} />
      </Box>
    </TextEditorToolbarButton>
  );
};

export default MessageImageButton;

