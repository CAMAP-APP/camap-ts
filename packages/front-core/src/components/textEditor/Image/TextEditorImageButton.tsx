import { Catalog, useGetActiveCatalogsPicturesLazyQuery, Vendor } from '@gql';
import { Image } from '@mui/icons-material';
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
import { encodeFileToBase64String } from '@utils/encoding';
import { getBase64EncodedImage } from '@utils/image';
import { logError } from '@utils/logger';
import imageCompression from 'browser-image-compression';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSlateStatic } from 'slate-react';
import { TextEditorComponents } from '../TextEditorComponents';
import { insertImage } from './withImage';

type CatalogType = Pick<Catalog, 'id'> & {
  vendor: Pick<Vendor, 'name' | 'id' | 'image'>;
};

interface InsertImageButtonProps {
  onAddImagesCustomHandle?: (image: File[]) => void;

  // Pass a group ID to show active catalogs images
  groupId?: number;
}

const TextEditorImageButton = ({
  groupId,
  onAddImagesCustomHandle,
}: InsertImageButtonProps) => {
  const { t } = useTranslation(['messages/default']);
  const [getActiveCatalogs, { data: activeContractsData }] =
    useGetActiveCatalogsPicturesLazyQuery();
  const editor = useSlateStatic();
  const imageInput = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isActive, setIsActive] = React.useState(false);
  const [catalogValue, setCatalogValue] = React.useState<
    CatalogType | undefined
  >(undefined);
  const [catalogInputValue, setCatalogInputValue] = React.useState('');

  React.useEffect(() => {
    if (!groupId) return;

    getActiveCatalogs({
      variables: { groupId },
    });
  }, [getActiveCatalogs, groupId]);

  const openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsActive(true);
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setIsActive(false);
  };

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (groupId) {
      openMenu(event);
    } else {
      openUploadImageInput();
    }
  };

  const openUploadImageInput = () => {
    if (!imageInput || !imageInput.current) return;
    closeMenu();
    imageInput.current.value = '';
    imageInput.current.click();
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !event ||
      !event.target ||
      !event.target.files ||
      event.target.files.length === 0
    )
      return;
    setLoading(true);
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';
    const file = event.target.files[0];

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);

      const base64 = await encodeFileToBase64String(compressedFile as File);
      if (base64) {
        const fileName = file.name;
        insertImage(editor, getBase64EncodedImage(base64, file.type), fileName);
        if (onAddImagesCustomHandle) onAddImagesCustomHandle([file]);
      }
      setLoading(false);
      document.body.style.cursor = previousCursor;
    } catch (error) {
      setLoading(false);
      document.body.style.cursor = previousCursor;
      logError(error);
    }
  };

  const onCatalogSelected = (
    _event: React.ChangeEvent,
    newValue: CatalogType,
    reason: AutocompleteChangeReason,
  ) => {
    if (reason === 'blur' || reason === 'clear') {
      setCatalogValue(undefined);
      setCatalogInputValue('');
      return;
    }
    if (!newValue) return;
    closeMenu();
    const image = newValue.vendor.image as string;
    insertImage(editor, `${process.env.CAMAP_HOST}${image}`);
  };

  const onCatalogInputChange = (
    _: React.ChangeEvent,
    newInputValue: string,
  ) => {
    setCatalogInputValue(newInputValue);
  };

  const catalogsWithImage =
    activeContractsData?.getActiveCatalogs &&
    activeContractsData?.getActiveCatalogs.filter((c) => !!c.vendor.image);

  return (
    <TextEditorComponents
      active={isActive}
      onMouseDown={onMouseDown}
      aria-controls="image-upload-menu"
      aria-haspopup="true"
    >
      {loading ? (
        <CircularProgress size={24 - 3.6} />
      ) : (
        <Image sx={{ display: 'block' }} />
      )}
      {groupId && (
        <Menu
          id="image-upload-menu"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={closeMenu}
        >
          <MenuItem
            onClick={openUploadImageInput}
            sx={{ height: '56px', paddingLeft: '30px' }}
          >
            {t('form.fromDevice')}
          </MenuItem>
          {catalogsWithImage && (
            <ListItem>
              <Autocomplete
                options={catalogsWithImage}
                getOptionLabel={(option) => (option ? option.vendor.name : '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('form.fromCatalog')}
                    variant="outlined"
                  />
                )}
                autoSelect
                autoHighlight
                fullWidth
                style={{ width: 300 }}
                clearOnEscape
                clearOnBlur
                value={catalogValue}
                onChange={onCatalogSelected}
                inputValue={catalogInputValue}
                onInputChange={onCatalogInputChange}
              />
            </ListItem>
          )}
        </Menu>
      )}
      <Box display="none">
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          onChange={uploadImage}
        />
      </Box>
    </TextEditorComponents>
  );
};

export default TextEditorImageButton;
