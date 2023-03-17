import { alpha, Box, darken, SxProps, Theme, Typography } from '@mui/material';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { RestCsaMultiDistribWithVolunteerRoles } from '../requests';

interface VolunteersCalendarDistributionProps {
  multiDistrib: RestCsaMultiDistribWithVolunteerRoles;
  outline: boolean;
}

const VolunteersCalendarDistribution = ({
  multiDistrib,
  outline,
}: VolunteersCalendarDistributionProps) => {
  const { t } = useCamapTranslation({
    t: 'volunteers-calendar',
  });

  let sxColors: SxProps = {
    bgcolor: 'initial',
    color: 'initial',
  };

  if (multiDistrib.hasVacantVolunteerRoles) {
    sxColors = {
      bgcolor: (theme: Theme) => alpha(theme.palette.error.light, 0.15),
      color: (theme: Theme) => darken(theme.palette.error.dark, 0.01),
    };
  } else if (multiDistrib.canVolunteersJoin) {
    sxColors = {
      bgcolor: (theme: Theme) => alpha(theme.palette.success.light, 0.15),
      color: (theme: Theme) => darken(theme.palette.success.dark, 0.01),
    };
  }

  if (outline) {
    sxColors.boxShadow = (theme: Theme) => theme.shadows[4];
  }

  return (
    <Box
      minHeight={125}
      height="100%"
      width={{
        xs: 120,
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
    >
      <Typography>
        <b>
          {formatAbsoluteDate(new Date(multiDistrib.distribStartDate), true)}
        </b>
      </Typography>

      <Typography variant="caption">
        <Box display="flex" alignItems={'center'}>
          <CamapIcon
            id={
              multiDistrib.hasVacantVolunteerRoles
                ? CamapIconId.info
                : CamapIconId.check
            }
            sx={{ mr: 0.3 }}
          />
          {t('nRegisterdOutOfnRequired', {
            registered: multiDistrib.volunteersRegistered,
            required: multiDistrib.volunteersRequired,
            count: multiDistrib.volunteersRegistered,
          })}
        </Box>
      </Typography>
    </Box>
  );
};

export default VolunteersCalendarDistribution;
