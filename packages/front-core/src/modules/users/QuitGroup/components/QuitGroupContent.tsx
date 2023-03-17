import { Typography } from '@mui/material';
import { User } from '../../../../gql';
import { formatUserAndPartnerNames } from '../../../../utils/fomat';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';

interface QuitGroupContentProps {
  user: Pick<User, 'email' | 'email2'>;
}

const QuitGroupContent = ({ user }: QuitGroupContentProps) => {
  const { t, tBasics } = useCamapTranslation({
    t: 'users/account',
    tBasics: 'translation',
  });

  return (
    <>
      <Typography gutterBottom>
        {t('yourAccount')} : <b>{formatUserAndPartnerNames(user)}</b> (
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
