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
import { encodeFileToBase64String } from '@utils/encoding';
import { getBase64EncodedImage } from '@utils/image';
import { logError } from '@utils/logger';
import imageCompression from 'browser-image-compression';
import React, { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Transforms, Editor } from 'slate';
import { useEditorRef } from '@platejs/core/react';
import CamapIcon, { CamapIconId } from '@components/utils/CamapIcon';
import { getCamapHost } from 'lib/runtimeCfg';
import { removeAccents, removeSpaces } from '@utils/fomat/string';
import { TextEditorComponents } from '../../../components/textEditor/TextEditorComponents';

type CatalogType = Pick<Catalog, 'id'> & {
  vendor: Pick<Vendor, 'name' | 'id' | 'image'>;
};

interface InsertImageButtonProps {
  onAddImagesCustomHandle?: (image: File[]) => void;
  groupId?: number;
}

const insertMessageImage = (
  editor: Editor,
  {
    dataUrl,
    url,
    filename,
  }: { dataUrl?: string; url: string; filename?: string },
) => {
  const cid = filename ? removeSpaces(removeAccents(filename)) : undefined;
  const isEmbedded = !!dataUrl && dataUrl.startsWith('data:image');

  const imageNode = {
    type: 'img',
    url: isEmbedded && cid ? `cid:${cid}` : url,
    dataUrl: isEmbedded ? dataUrl : undefined,
    filename,
    cid: isEmbedded ? cid : undefined,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, imageNode);
};

const MessageImageButton = ({ groupId, onAddImagesCustomHandle }: InsertImageButtonProps) => {
  const { t } = useTranslation(['messages/default']);
  const [getActiveCatalogs, { data: activeContractsData }] =
    useGetActiveCatalogsPicturesLazyQuery();
  const plateEditor = useEditorRef();
  const editor = plateEditor as unknown as Editor;
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
        const dataUrl = getBase64EncodedImage(base64, file.type);
        insertMessageImage(editor, { dataUrl, url: dataUrl, filename: fileName });
        onAddImagesCustomHandle?.([file]);
      }
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
    const url = `${getCamapHost()}${image}`;
    insertMessageImage(editor, { url, filename: undefined });
  };

  const catalogsWithImage =
    activeContractsData?.getActiveCatalogs?.filter((c) => !!c.vendor?.image);

  return (
    <TextEditorComponents
      active={isActive}
      onMouseDown={onMouseDown}
      aria-controls="message-image-upload-menu"
      aria-haspopup="true"
    >
      {loading ? (
        <CircularProgress size={24 - 3.6} />
      ) : (
        <CamapIcon id={CamapIconId.image} sx={{ display: 'block' }} />
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
    </TextEditorComponents>
  );
};

export default MessageImageButton;

