import { Typography } from '@mui/material';
import Block from '../../../components/utils/Block/Block';
import SubBlock from '../../../components/utils/Block/SubBlock';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import { formatUserName } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import MediumActionIcon from '../containers/MediumActionIcon';
import { RestCsaCatalog } from '../interfaces';

interface CsaCatalogCoordinatorBlockProps {
  catalog: RestCsaCatalog;
  isSubBlock?: boolean;
}

const CsaCatalogCoordinatorBlock = ({
  catalog,
  isSubBlock = false,
}: CsaCatalogCoordinatorBlockProps) => {
  const { t } = useCamapTranslation({
    t: 'csa-catalog',
  });

  const BlockComponent = isSubBlock ? SubBlock : Block;

  const otherProps: Record<string, any> = {};
  if (!isSubBlock) {
    otherProps.icon = <MediumActionIcon id={CamapIconId.user} />;
  }

  if (!catalog.contact) return null;

  return (
    <BlockComponent
      title={t('coordinator')}
      sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      contentSx={{
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        justifyContent: 'space-evenly',
        flexDirection: 'column',
        maxHeight: 200,
        my: 'auto',
      }}
      {...otherProps}
    >
      <>
        <Typography>
          <b>{formatUserName(catalog.contact)}</b>
        </Typography>
        <Typography>{catalog.contact.email}</Typography>
        <Typography>{catalog.contact.phone}</Typography>
      </>
    </BlockComponent>
  );
};

export default CsaCatalogCoordinatorBlock;
