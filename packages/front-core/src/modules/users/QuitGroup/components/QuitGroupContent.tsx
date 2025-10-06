import { Typography } from '@mui/material';
import { User } from '../../../../gql';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';
import { formatCoupleName } from 'camap-common';

interface QuitGroupContentProps {
  user: User;
}

const QuitGroupContent = ({ user }: QuitGroupContentProps) => {
  const { t, tBasics } = useCamapTranslation({
    t: 'users/account',
    tBasics: 'translation',
  });

  return (
    <>
      <Typography gutterBottom>
        {t('yourAccount')} : <b>{formatCoupleName(user)}</b> (
        {user.email}
        {user.email2 && ` ${tBasics('and')} ${user.email2}`})
      </Typography>
      <Typography>{t('ifYouQuitThisGroup')}</Typography>
      <Typography component="li">{t('youWontGetMessages')}</Typography>
      <Typography component="li">{t('yourCommandsWillBeStored')}</Typography>
    </>
  );
};

export default QuitGroupContent;
