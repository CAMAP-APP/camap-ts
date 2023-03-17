import {
  Box,
  Button,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { RestCsaMultiDistribWithVolunteerRoles } from '../requests';

interface VolunteersCalendarDistributionRoleProps {
  multiDistrib: RestCsaMultiDistribWithVolunteerRoles;
  userId: number;
  roleId: number;
  daysBeforeDutyPeriodsOpen: number;
  returnUrl: string;
}

const VolunteersCalendarDistributionRole = ({
  multiDistrib,
  userId,
  roleId,
  daysBeforeDutyPeriodsOpen,
  returnUrl,
}: VolunteersCalendarDistributionRoleProps) => {
  const { t } = useCamapTranslation({
    t: 'volunteers-calendar',
  });

  const from = new Date();
  const to = new Date();

  const hasVolunteerRole = multiDistrib.hasVolunteerRole[roleId];
  const volunteer = hasVolunteerRole
    ? multiDistrib.volunteerForRole[roleId]
    : undefined;

  let sxColors: SxProps = {
    bgcolor: 'initial',
    color: 'initial',
  };
  if (!hasVolunteerRole) {
    sxColors = {
      bgcolor: (theme: Theme) => theme.palette.action.disabledBackground,
      color: (theme: Theme) => theme.palette.action.disabled,
    };
  }

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
                  href={`/distribution/unsubscribeFromRole/${multiDistrib.id}/${roleId}?returnUrl=${returnUrl}&from=${from}&to${to}`}
                >
                  {t('unsubscribe')}
                </Button>
              )}
            </>
          )}
          {!volunteer && multiDistrib.canVolunteersJoin && (
            <Button
              variant="contained"
              href={`/distribution/volunteersCalendar?returnUrl=${returnUrl}&distrib=${multiDistrib.id}&role=${roleId}&from=${from}&to=${to}`}
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
    </Box>
  );
};

export default VolunteersCalendarDistributionRole;
