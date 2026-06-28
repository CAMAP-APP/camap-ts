import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { RestCsaMultiDistribWithVolunteerRoles, useRestUnsubscribeFromRole } from '../requests';

interface VolunteersCalendarDistributionRoleProps {
  multiDistrib: RestCsaMultiDistribWithVolunteerRoles;
  userId: number;
  roleId: number;
  roleName: string;
  daysBeforeDutyPeriodsOpen: number;
  onUnsubscribeSuccess: () => void;
}

const VolunteersCalendarDistributionRole = ({
  multiDistrib,
  userId,
  roleId,
  roleName,
  daysBeforeDutyPeriodsOpen,
  onUnsubscribeSuccess,
}: VolunteersCalendarDistributionRoleProps) => {
  const { t } = useCamapTranslation({
    t: 'volunteers-calendar',
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [unsubscribe, { error }] = useRestUnsubscribeFromRole(multiDistrib.id, roleId);

  const roleKey = String(roleId);
  const hasVolunteerRole = !!multiDistrib.hasVolunteerRole?.[roleKey];
  const volunteer = hasVolunteerRole
    ? (multiDistrib.volunteerForRole?.[roleKey] ?? null)
    : null;

  let sxColors: SxProps<Theme> = {
    bgcolor: 'initial',
    color: 'initial',
  };
  if (!hasVolunteerRole) {
    sxColors = {
      bgcolor: (theme: Theme) => theme.palette.action.disabledBackground,
      color: (theme: Theme) => theme.palette.action.disabled,
    };
  }

  const distribDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(multiDistrib.distribStartDate));

  const handleConfirm = async () => {
    setLoading(true);
    const success = await unsubscribe({} as Record<string, never>);
    setLoading(false);
    if (success) {
      setDialogOpen(false);
      onUnsubscribeSuccess();
    }
  };

  return (
    <Box
      minHeight={110}
      height="100%"
      width={{
        xs: 125,
        sm: 150,
      }}
      p={1}
      display="flex"
      flexDirection={'column'}
      alignItems="center"
      borderRadius={1}
      textAlign="center"
      justifyContent={'space-evenly'}
      sx={sxColors}
      position="relative"
    >
      {hasVolunteerRole ? (
        <>
          {!!volunteer && (
            <>
              <Typography>{volunteer.coupleName}</Typography>
              {volunteer.id === userId && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDialogOpen(true)}
                >
                  {t('unsubscribe')}
                </Button>
              )}
            </>
          )}
          {!volunteer && multiDistrib.canVolunteersJoin && (
            <Button
              variant="contained"
              href={`/distribution/volunteersCalendar?distrib=${multiDistrib.id}&role=${roleId}`}
            >
              {t('join')}
            </Button>
          )}
          {!volunteer && !multiDistrib.canVolunteersJoin && (
            <Typography variant="caption">
              {t('dutyPeriodsOpenForVolunteersDaysBeforeTheDutyPeriod', {
                days: daysBeforeDutyPeriodsOpen,
              })}
            </Typography>
          )}
        </>
      ) : (
        <Tooltip
          title={`${t('thisRoleDoesNotNeedVolunteerForThisDate')}`}
          arrow
          PopperProps={{ sx: { textAlign: 'center' } }}
        >
          <Box position={'absolute'} top={0} left={0} right={0} bottom={0} />
        </Tooltip>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {t('unsubscribeDialogTitle', { roleName, distribDate })}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t('unsubscribeDialogMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            disabled={loading}
          >
            {t('yes')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolunteersCalendarDistributionRole;
