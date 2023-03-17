import { ChevronRight, Person } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  SxProps,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MuiDialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import AlertError from '../../components/utils/AlertError';
import theme from '../../theme';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { goTo } from '../../utils/url';
import LoginBox from './LoginBox';
import RegistrationBox from './RegistrationBox';

export interface LoginRegistrationProps {
  redirectUrl: string;
  sid: string;
  message?: string;
  phoneRequired?: boolean;
  addressRequired?: boolean;
  openRegistration?: boolean;
  invitedUserEmail?: string;
  invitedGroupId?: number;
  onClose?: () => void;
  asDialog?: boolean;
  hideTitle?: boolean;
  preFilledEmail?: string;
}

interface DialogTitleProps {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = ({ children, onClose, ...other }: DialogTitleProps) => {
  return (
    <MuiDialogTitle sx={{ margin: 0, padding: 2 }} {...other}>
      {children}
      <IconButton
        aria-label="close"
        onClick={onClose}
        size="large"
        sx={{
          position: 'absolute',
          right: 1,
          top: 1,
          color: 'grey.500',
        }}
      >
        <CloseIcon />
      </IconButton>
    </MuiDialogTitle>
  );
};

const LOGIN_FORM_DIALOG_TITLE_ID = 'login-form-dialog-title';

const LoginRegistrationModule = ({
  redirectUrl,
  sid,
  message = '',
  phoneRequired = false,
  addressRequired = false,
  openRegistration = false,
  invitedUserEmail,
  invitedGroupId,
  onClose,
  asDialog = true,
  hideTitle = false,
  preFilledEmail: initialPrefilledEmail,
}: LoginRegistrationProps) => {
  if (typeof redirectUrl !== 'string')
    throw new Error('LoginRegistration requires a redirectUrl');
  if (typeof sid !== 'string')
    throw new Error('LoginRegistration requires a sid');
  const { t } = useCamapTranslation({
    t: 'login-registration',
  });
  const [open, setOpen] = React.useState(true);
  const [isLogin, setIsLogin] = React.useState(!openRegistration);
  const [preFilledEmail, setPreFilledEmail] = React.useState(
    initialPrefilledEmail,
  );
  const [showEmailAlreadyRegistered, setShowEmailAlreadyRegistered] =
    React.useState(false);

  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const toggleLoginRegistration = () => {
    setIsLogin(!isLogin);
    if (!asDialog) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleLoginWithPrefilledEmail = (email: string) => {
    setPreFilledEmail(email);
    setShowEmailAlreadyRegistered(true);
    toggleLoginRegistration();
  };

  const redirect = () => {
    handleClose();
    goTo(redirectUrl);
  };

  const Container = ({ children }: { children: React.ReactNode }) =>
    asDialog ? (
      <Dialog
        open={open}
        PaperProps={{
          sx: isDownSm
            ? {
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
              }
            : {
                position: 'absolute',
                top: 0,
              },
        }}
        aria-labelledby={LOGIN_FORM_DIALOG_TITLE_ID}
      >
        {children}
      </Dialog>
    ) : (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
        }}
      >
        {children}
      </Card>
    );

  const Title = () => (
    <Typography variant="h2" component={'span'}>
      {isLogin ? t('login') : t('registration')}
    </Typography>
  );
  const Header = () =>
    asDialog ? (
      <DialogTitle id={LOGIN_FORM_DIALOG_TITLE_ID} onClose={handleClose}>
        <Title />
      </DialogTitle>
    ) : (
      <CardHeader
        id={LOGIN_FORM_DIALOG_TITLE_ID}
        sx={{ margin: 0, textAlign: 'center', paddingBottom: 0 }}
        title={<Title />}
      />
    );

  const Content = ({
    children,
    sx,
  }: {
    children: React.ReactNode;
    sx?: SxProps;
  }) =>
    asDialog ? (
      <DialogContent dividers ref={contentRef} sx={sx}>
        {children}
      </DialogContent>
    ) : (
      <CardContent ref={contentRef} sx={sx}>
        {children}
      </CardContent>
    );

  const Actions = asDialog ? DialogActions : CardActions;

  return (
    <Container>
      {hideTitle || <Header />}
      <Content sx={hideTitle ? { paddingTop: 0 } : undefined}>
        {message && (
          <Box pb={2} whiteSpace="pre-line">
            <AlertError message={message} severity={'warning'} />
          </Box>
        )}
        {showEmailAlreadyRegistered && (
          <Box pb={2} whiteSpace="pre-line">
            <AlertError
              message={t('emailAlreadyRegistered')}
              severity={'warning'}
            />
          </Box>
        )}
        {isLogin ? (
          <LoginBox
            redirect={redirect}
            sid={sid}
            preFilledEmail={preFilledEmail}
          />
        ) : (
          <RegistrationBox
            redirect={redirect}
            redirectUrl={redirectUrl}
            sid={sid}
            addressRequired={addressRequired}
            phoneRequired={phoneRequired}
            invitedUserEmail={invitedUserEmail}
            invitedGroupId={invitedGroupId}
            dialogContentRef={contentRef.current || undefined}
            preFilledEmail={preFilledEmail}
            toggleLoginWithPrefilledEmail={toggleLoginWithPrefilledEmail}
          />
        )}
      </Content>
      <Actions>
        <Box
          width="100%"
          flexDirection="row"
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={{ xs: 0, sm: 1 }}
        >
          <Typography variant="subtitle2">
            {isLogin ? t('firstVisit') : t('alreadyRegistered')}
          </Typography>
          {'\u00A0'}
          {'\u00A0'}
          <Button
            onClick={toggleLoginRegistration}
            startIcon={isLogin ? <ChevronRight /> : <Person />}
            variant="outlined"
          >
            {isLogin ? t('register') : t('login')}
          </Button>
        </Box>
      </Actions>
    </Container>
  );
};

export default LoginRegistrationModule;
