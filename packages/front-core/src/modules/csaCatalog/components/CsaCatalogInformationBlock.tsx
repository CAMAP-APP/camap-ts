import { InsertDriveFile } from '@mui/icons-material';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import Block from '../../../components/utils/Block/Block';
import SubBlock from '../../../components/utils/Block/SubBlock';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import MediumActionIcon from '../containers/MediumActionIcon';
import { RestCsaCatalog } from '../interfaces';
import DOMPurify from 'dompurify';

const host = process.env.CAMAP_HOST;

interface CsaCatalogInformationBlockProps {
  catalog: RestCsaCatalog;
  isSubBlock?: boolean;
}

const CsaCatalogInformationBlock = ({
  catalog,
  isSubBlock = false,
}: CsaCatalogInformationBlockProps) => {
  const { t } = useCamapTranslation({
    t: 'csa-catalog',
  });

  const BlockComponent = isSubBlock ? SubBlock : Block;

  const otherProps: Record<string, any> = {};
  if (!isSubBlock) {
    otherProps.icon = <MediumActionIcon id={CamapIconId.info} />;
  }

  return (
    <BlockComponent title={t('info')} {...otherProps}>
      <Box display="flex" flexDirection={'column'}>
        <Typography
          sx={{
            overflow: 'auto',
            maxHeight: {
              xs: 150,
              sm: 225,
              md: 300,
            },
          }}
        >
          <span dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(catalog.description ?? "")}}/>
        </Typography>
        {catalog.documents.length > 0 && (
          <List sx={{ pb: 0, mb: -1.5, flexShrink: 0 }}>
            {catalog.documents.map((d) => (
              <ListItemButton
                key={d.url}
                component="a"
                href={`${host}${d.url}`}
                target="_blank"
              >
                <ListItemIcon
                  sx={{
                    minWidth: {
                      xs: 32,
                      sm: 48,
                      md: 56,
                    },
                  }}
                >
                  <InsertDriveFile />
                </ListItemIcon>
                <ListItemText
                  primary={d.name}
                  sx={{ wordBreak: 'break-all' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </BlockComponent>
  );
};

export default CsaCatalogInformationBlock;
