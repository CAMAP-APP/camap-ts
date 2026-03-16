import { alpha, Box, darken, Theme, Typography } from '@mui/material';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';
import { Colors } from '../../../theme/commonPalette';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { RestDistributionEnriched, RestDistributionState } from '../interfaces';

interface CsaCatalogDistributionProps {
  distribution: RestDistributionEnriched;
}

export function colorForDistributionState(distribution: RestDistributionEnriched) {
  if (distribution.state === RestDistributionState.Open)
    return {
      bgcolor: (theme: Theme) => alpha(theme.palette.success.light, 0.15),
      color: (theme: Theme) => darken(theme.palette.success.dark, 0.05),
    }
  if (distribution.state === RestDistributionState.NotYetOpen ||
    distribution.state === RestDistributionState.Closed)
    return {
      bgcolor: (theme: Theme) => theme.palette.action.disabledBackground,
      color: (theme: Theme) => alpha(theme.palette.text.primary, 0.75),
    }
  if (distribution.state === RestDistributionState.Absent)
    return {
      bgcolor: alpha(Colors.terreLight, 0.65),
      color: darken(Colors.terreDark, 0.1),
    }
  return {}
}

const CsaCatalogDistribution = ({
  distribution,
}: CsaCatalogDistributionProps) => {
  const { t } = useCamapTranslation({
    t: 'csa-catalog',
  });

  let iconId = CamapIconId.basket;
  if (
    distribution.state === RestDistributionState.NotYetOpen ||
    distribution.state === RestDistributionState.Closed
  )
    iconId = CamapIconId.clock;
  if (distribution.state === RestDistributionState.Absent)
    iconId = CamapIconId.absent;

  return (
    <Box
      minHeight={176}
      height="100%"
      width={150}
      p={1}
      display="flex"
      flexDirection={'column'}
      alignItems="center"
      borderRadius={1}
      textAlign="center"
      justifyContent={'space-between'}
      sx={{
        ...colorForDistributionState(distribution)
      }}
    >
      <Typography>
        <b>
          {formatAbsoluteDate(
            distribution.distributionStartDate,
            false,
            true,
            true,
          )}
        </b>
      </Typography>
      <CamapIcon
        id={iconId}
        fontSize="medium"
        sx={{ my: 1, overflow: 'visible' }}
      />
      <Typography variant="caption">
        @ <u>
          {distribution.place.name}</u>
      </Typography>
      <Typography variant="caption">
        {distribution.state === RestDistributionState.Open &&
          t('orderBeforeThe', {
            date: formatAbsoluteDate(distribution.orderEndDate, true),
          })}
        {distribution.state === RestDistributionState.NotYetOpen &&
          t('orderOpenThe', {
            date: formatAbsoluteDate(distribution.orderStartDate, true),
          })}
        {distribution.state === RestDistributionState.Closed &&
          t('orderClosed')}
        {distribution.state === RestDistributionState.Absent && t('absent')}
      </Typography>
    </Box>
  );
};

export default CsaCatalogDistribution;
