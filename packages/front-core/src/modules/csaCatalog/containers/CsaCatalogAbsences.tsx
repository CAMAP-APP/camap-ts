import { LoadingButton } from '@mui/lab';
import {
	Alert,
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Tooltip,
	Typography,
} from '@mui/material';
import { isBefore } from 'date-fns';
import React from 'react';
import Block from '../../../components/utils/Block/Block';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { RestDistributionEnriched } from '../interfaces';
import { useRestCatalogAbsencesLazyGet } from '../requests';
import MediumActionIcon from './MediumActionIcon';

interface CsaCatalogAbsencesProps {
	adminMode?: boolean;
  onNext: () => Promise<void>;
}

const CsaCatalogAbsences = ({ adminMode,onNext }: CsaCatalogAbsencesProps) => {
  const { t, tCommon } = useCamapTranslation(
    {
      t: 'csa-catalog',
    },
    true,
  );

  const {
    catalogId,
    absenceDistributionsIds,
    setAbsenceDistributionsIds,
    nextDistributionIndex,
    distributions,
    subscription,
    subscriptionAbsences,
  } = React.useContext(CsaCatalogContext);

  const [getCatalogAbsences, { data: catalogAbsences, error }] =
    useRestCatalogAbsencesLazyGet(catalogId);

  React.useEffect(() => {
    if (!!subscription) return;

    getCatalogAbsences();
  }, [getCatalogAbsences, subscription]);

  const [nbOfAbsenceDays, setNbOfAbsenceDays] = React.useState<number>(0);

  React.useEffect(() => {
    if (!subscriptionAbsences) return;

    // If the user already has a subscription with absences
    setNbOfAbsenceDays(subscriptionAbsences.absentDistribIds.length);
    setAbsenceDistributionsIds(subscriptionAbsences.absentDistribIds);
  }, [setAbsenceDistributionsIds, subscriptionAbsences]);

  const handleNbOfAbsenceDaysChange = (event: SelectChangeEvent<number>) => {
    const { value } = event.target;
    const nb = typeof value === 'string' ? parseInt(value) : value;
    setNbOfAbsenceDays(nb);
    setAbsenceDistributionsIds(Array(nb).fill(''));
  };

  const handleAbsenceDistributionsChange = (index: number, value: number) => {
    const newAbsenceDistributions = absenceDistributionsIds
      ? [...absenceDistributionsIds]
      : [];
    newAbsenceDistributions[index] = value;
    setAbsenceDistributionsIds(newAbsenceDistributions);
  };

  const passedDistributions: RestDistributionEnriched[] = React.useMemo(() => {
    if (!subscriptionAbsences) return [];
    const passed: RestDistributionEnriched[] = [];
    const now = new Date();
    subscriptionAbsences.absentDistribIds.forEach((did) => {
      const distribution = distributions.find((d) => d.id === did);
      if (!distribution || !isBefore(distribution.orderEndDate, now)) {
        return;
      }
      passed.push(distribution);
    });
    return passed;
  }, [distributions, subscriptionAbsences]);

  const possibleAbsentDistribs = React.useMemo(() => {
    const now = new Date();
    if (!subscription) {
      if (!catalogAbsences) return [];
      return distributions.filter((d) => {
        if (
          catalogAbsences.possibleAbsentDistribs.findIndex(
            (d2) => d2.id === d.id,
          ) === -1
        )
          return false;
        if (isBefore(d.orderEndDate, now)) return false;

        return true;
      });
    } else {
      if (!subscriptionAbsences) return [];
      return distributions
        .filter(
          (d) =>
            subscriptionAbsences.possibleAbsentDistribs.findIndex(
              (d2) => d2.id === d.id,
            ) > -1,
        )
        .concat(passedDistributions);
    }
  }, [
    catalogAbsences,
    distributions,
    nextDistributionIndex,
    passedDistributions,
    subscriptionAbsences,
    subscription,
  ]);

  const isDisabledDistribution = React.useCallback(
    (index: number) => {
      return absenceDistributionsIds
        ? passedDistributions.findIndex(
            (d) => d.id === absenceDistributionsIds[index],
          ) > -1
        : false;
    },
    [absenceDistributionsIds, passedDistributions],
  );

  const [loading, setLoading] = React.useState(false);

  const onButtonClick = async () => {
    setLoading(true);
    await onNext();
    setLoading(false);
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (
    (!subscription && !catalogAbsences) ||
    (!!subscription && !subscriptionAbsences)
  )
    return <CircularProgressBox />;

  const absentDistribsMaxNb = !subscription
    ? catalogAbsences!.absentDistribsMaxNb
    : subscriptionAbsences!.absentDistribIds.length;
  const startDate = !subscription
    ? catalogAbsences!.startDate
    : subscriptionAbsences!.startDate;
  const endDate = !subscription
    ? catalogAbsences!.endDate
    : subscriptionAbsences!.endDate;

  return (
    <Box
      width={{
        xs: '100%',
        sm: '75%',
        md: '50%',
      }}
      mx="auto"
    >
      <Block
        title={t('absences')}
        icon={<MediumActionIcon id={CamapIconId.vacation} />}
        sx={{ height: '100%' }}
      >
        <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
          {t(adminMode ? 'absencesInfosAdmin' : 'absencesInfos', {
            count: absentDistribsMaxNb,
            startDate: formatAbsoluteDate(
              new Date(startDate),
              false,
              false,
              true,
            ),
            endDate: formatAbsoluteDate(new Date(endDate), false, false, true),
          })}
        </Typography>

        {!subscription && (
          <Box width={{ xs: '100%', md: '70%' }} mx="auto" my={3}>
            <FormControl fullWidth>
              <InputLabel id="nb-absence-select-label">
                {t('nbOfAbsenceDays')}
              </InputLabel>
              <Select
                labelId="nb-absence-select-label"
                value={nbOfAbsenceDays}
                label={t('nbOfAbsenceDays')}
                onChange={handleNbOfAbsenceDaysChange}
              >
                <MenuItem key={`absence_nb_0`} value={0}>
                  0
                </MenuItem>
                {Array.from(Array(absentDistribsMaxNb).keys()).map((i) => (
                  <MenuItem key={`absence_nb_${i + 1}`} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box width={{ xs: '100%', md: '70%' }} mx="auto" mt={3} mb={1}>
          {nbOfAbsenceDays > 0 &&
            Array.from(Array(nbOfAbsenceDays).keys()).map((i) => (
              <Box key={`distribution_${i}`} my={1}>
                <Tooltip
                  title={
                    isDisabledDistribution(i)
                      ? `${t(
                          'orderEndDateIsPassedItsTooLateToChangeThisAbsence',
                        )}`
                      : ''
                  }
                >
                  <FormControl fullWidth>
                    <InputLabel id="nb-absence-select-label">
                      {`${t('absence')} ${i + 1}`}
                    </InputLabel>
                    <Select
                      labelId="nb-absence-select-label"
                      value={
                        absenceDistributionsIds
                          ? absenceDistributionsIds[i]
                          : ''
                      }
                      label={`${t('absence')} #${i + 1}`}
                      onChange={(event: SelectChangeEvent<number>) => {
                        const { value } = event.target;
                        const newValue =
                          typeof value === 'string' ? parseInt(value) : value;
                        return handleAbsenceDistributionsChange(i, newValue);
                      }}
                      disabled={isDisabledDistribution(i)}
                    >
                      {possibleAbsentDistribs
                        .filter((d) => {
                          if (!absenceDistributionsIds) return false;
                          const index = absenceDistributionsIds.indexOf(d.id);
                          if (index > -1 && index !== i) return false;
                          return true;
                        })
                        .map((distribution) => (
                          <MenuItem
                            key={`absence_distrib_${distribution.id}`}
                            value={distribution.id}
                            sx={{ mt: 1 }}
                          >
                            {formatAbsoluteDate(
                              distribution.distributionStartDate,
                              false,
                              true,
                              true,
                            )}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Box>
            ))}
        </Box>
        <Box width="100%" textAlign="center" mt={1}>
          <LoadingButton
            loading={loading}
            disabled={
              !!absenceDistributionsIds &&
              absenceDistributionsIds.length > 0 &&
              absenceDistributionsIds.indexOf('') !== -1
            }
            variant="contained"
            onClick={onButtonClick}
          >
            {tCommon('save')}
          </LoadingButton>
        </Box>
      </Block>
    </Box>
  );
};

export default CsaCatalogAbsences;
