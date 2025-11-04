import { useTranslation } from 'react-i18next';
import DashboardLayout from './DashboardLayout';
import CamapIcon from '@components/utils/CamapIcon';
import { Announcement } from '@mui/icons-material';

const AdminLayout = () => {
  const { t } = useTranslation(['admin', 'translation']);

  const navigationItems = [
    {
      path: '/admin/errors',
      label: 'Errors',
      icon: <CamapIcon id="home" />
    },
    {
      path: '/admin/emails',
      label: 'Emails',
      icon: <CamapIcon id="mail" />
    },
    {
      path: '/admin/messages',
      label: 'Message Général',
      icon: <Announcement />
    },
    {
      path: '/admin/attention',
      label: 'Message Groupes',
      icon: <Announcement />
    },
    {
      path: '/admin/attentionAdmins',
      label: 'Message Admins Groupes',
      icon: <Announcement />
    },
    {
      path: '/admin/group',
      label: 'Groupes',
      icon: <CamapIcon id="group" />
    },
    {
      path: '/admin/user',
      label: 'Utilisateurs',
      icon: <CamapIcon id="user" />
    },
  ];
  return <DashboardLayout home={{
    label: t('admin', { ns: 'admin' }),
    icon: <CamapIcon id="home" />,
    path: '/admin'
  }}
  navigation={navigationItems} />
};

export default AdminLayout;
