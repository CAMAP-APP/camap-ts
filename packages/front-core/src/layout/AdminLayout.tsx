import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DashboardLayout from './DashboardLayout';

const AdminLayout = () => {
  const { t } = useTranslation(['admin', 'translation']);

  const navigationItems = [
    {
      path: '/admin/errors',
      label: 'Errors',
      icon: <SettingsIcon />
    },
    {
      path: '/admin/emails',
      label: 'Emails',
      icon: <EmailIcon />
    },
    {
      path: '/admin/messages',
      label: 'Message Général',
      icon: <InfoIcon />
    },
    {
      path: '/admin/attention',
      label: 'Message Groupes',
      icon: <InfoIcon />
    },
    {
      path: '/admin/attentionAdmins',
      label: 'Message Admins Groupes',
      icon: <InfoIcon />
    },
    {
      path: '/admin/group',
      label: 'Groupes',
      icon: <GroupsIcon />
    },
    {
      path: '/admin/user',
      label: 'Utilisateurs',
      icon: <PersonIcon />
    },
  ];
  return <DashboardLayout home={{
    label: t('admin', { ns: 'admin' }),
    icon: <HomeIcon />,
    path: '/admin'
  }}
  navigation={navigationItems} />
};

export default AdminLayout;
