import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { addMonths, format, isAfter, subMonths } from 'date-fns';
import React from 'react';
import BackButton from '../../components/utils/BackButton';
import Block from '../../components/utils/Block/Block';
import { CamapIconId } from '../../components/utils/CamapIcon';
import CircularProgressBox from '../../components/utils/CircularProgressBox';
import {
  getSlideContainerSx,
  getSlideItemSx,
  SlideDirection,
} from '../../components/utils/Transitions/slide';
import theme from '../../theme';
import { formatAbsoluteDate } from '../../utils/fomat';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { goTo } from '../../utils/url';
import MediumActionIcon from '../csaCatalog/containers/MediumActionIcon';
import VolunteersCalendarDistribution from './components/VolunteersCalendarDistribution';
import VolunteersCalendarDistributionRole from './components/VolunteersCalendarDistributionRole';
import {
  RestCsaMultiDistribWithVolunteerRoles,
  RestCsaVolunteerRoles,
  useRestVolunteerMultiDistribsLazyGet,
} from './requests';

type LastClickedButton = 'next' | 'previous';

interface VolunteersCalendarProps {
  userId: number;
  toBeDone: number;
  done: number;
  fromDate: string;
  toDate: string;
  daysBeforeDutyPeriodsOpen: number;
  focusedMultiDistribId?: number;
}

const VolunteersCalendar = ({
  userId,
  toBeDone,
  done,
  fromDate,
  toDate,
  daysBeforeDutyPeriodsOpen,
  focusedMultiDistribId,
}: VolunteersCalendarProps) => {
  const { t, tCommon } = useCamapTranslation(
    {
      t: 'volunteers-calendar',
    },
    true,
  );

  const [maxNbDistribToShow, setMaxNbDistribToShow] = React.useState(1);
  const [firstDistributionIndex, setFirstDistributionIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState<SlideDirection>();

  const [lastClickedButton, setLastClickedButton] = React.useState<
    LastClickedButton | undefined
  >(undefined);
  const [shouldDisableButton, setShouldDisableButton] = React.useState<
    Record<LastClickedButton, boolean>
  >({ next: false, previous: false });

  const [multiDistribs, setMultiDistribs] = React.useState<
    RestCsaMultiDistribWithVolunteerRoles[]
  >([]);
  const [roles, setRoles] = React.useState<RestCsaVolunteerRoles[]>([]);
  const [getVolunteerMultiDistribs, { data, error, loading }] =
    useRestVolunteerMultiDistribsLazyGet();

  React.useEffect(() => {
    if (!data) return;
    // Roles
    let newRolesArray = roles.concat(data.roles);
    const isSameRolesArray = newRolesArray.every((role) => {
      const foundIndex = roles.findIndex((r) => r.id === role.id);
      return foundIndex > -1;
    });
    if (!isSameRolesArray) setRoles(newRolesArray);

    // MultiDistribs
    let newArray = multiDistribs.concat(data.multiDistribs);
    const isSameArray = newArray.every((multiDistrib) => {
      const foundIndex = multiDistribs.findIndex(
        (md) => md.id === multiDistrib.id,
      );
      return foundIndex > -1;
    });
    if (isSameArray) {
      const news = { ...shouldDisableButton };
      news[`${lastClickedButton}`] = true;
      setShouldDisableButton(news);
      return;
    }
    const currentDistribution =
      multiDistribs && multiDistribs[firstDistributionIndex];
    newArray = newArray
      .filter(
        (md, index) => newArray.findIndex((md2) => md2.id === md.id) === index,
      )
      .sort(
        (a, b) =>
          new Date(a.distribStartDate).getTime() -
          new Date(b.distribStartDate).getTime(),
      );
    const newFirstDistributionIndex =
      currentDistribution &&
      newArray.findIndex((md) => md.id === currentDistribution.id);
    setMultiDistribs(newArray);
    if (
      newFirstDistributionIndex &&
      newFirstDistributionIndex !== firstDistributionIndex
    ) {
      setFirstDistributionIndex(newFirstDistributionIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const doGetVolunteerMultiDistribs = React.useCallback(
    (from: Date, to: Date) => {
      const haxeDateFormat = 'yyyy-MM-dd 00:00:00';
      getVolunteerMultiDistribs(
        `${format(from, haxeDateFormat)}/${format(to, haxeDateFormat)}`,
      );
    },
    [getVolunteerMultiDistribs],
  );

  React.useEffect(() => {
    const now = new Date();
    const aMonthBefore = subMonths(now, 4);
    const aMonthLater = addMonths(now, 4);
    doGetVolunteerMultiDistribs(aMonthBefore, aMonthLater);
  }, [doGetVolunteerMultiDistribs]);

  const didGetNextDistributionIndexOnce = React.useRef(false);

  const nextDistributionIndex = React.useMemo(() => {
    if (didGetNextDistributionIndexOnce.current) return;
    if (!multiDistribs?.length) return 0;
    const now = new Date();
    const index = multiDistribs.findIndex((d) =>
      isAfter(new Date(d.distribStartDate), now),
    );
    didGetNextDistributionIndexOnce.current = true;
    return index !== -1 ? index : 0;
  }, [multiDistribs]);

  React.useEffect(() => {
    if (nextDistributionIndex === undefined) return;
    setFirstDistributionIndex(nextDistributionIndex);
    if (
      nextDistributionIndex + maxNbDistribToShow >=
      multiDistribs.length - 2
    ) {
      loadMoreMultiDistribsAfter();
    }
    if (nextDistributionIndex <= 2) {
      loadMoreMultiDistribsBefore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDistributionIndex]);

  const loadMoreMultiDistribsAfter = React.useCallback(() => {
    if (!multiDistribs?.length) return;
    const lastMultiDistrib = multiDistribs[multiDistribs.length - 1];
    const distribStartDate = new Date(lastMultiDistrib.distribStartDate);
    const aMonthLater = addMonths(distribStartDate, 4);
    setLastClickedButton('next');
    doGetVolunteerMultiDistribs(distribStartDate, aMonthLater);
  }, [doGetVolunteerMultiDistribs, multiDistribs]);

  const loadMoreMultiDistribsBefore = React.useCallback(() => {
    if (!multiDistribs?.length) return;
    const firstMultiDistrib = multiDistribs[0];
    const distribStartDate = new Date(firstMultiDistrib.distribStartDate);
    const aMonthBefore = subMonths(distribStartDate, 4);
    setLastClickedButton('previous');
    doGetVolunteerMultiDistribs(aMonthBefore, distribStartDate);
  }, [doGetVolunteerMultiDistribs, multiDistribs]);

  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'));

  React.useEffect(() => {
    if (isUpSm && !isUpMd) {
      setMaxNbDistribToShow(2);
    } else if (isUpMd && !isUpLg) {
      setMaxNbDistribToShow(3);
    } else if (isUpLg) {
      setMaxNbDistribToShow(4);
    } else {
      setMaxNbDistribToShow(1);
    }
  }, [isUpSm, isUpMd, isUpLg]);

  const didFocusOnMultiDistribOnce = React.useRef(false);

  React.useEffect(() => {
    if (didFocusOnMultiDistribOnce.current) return;
    if (!focusedMultiDistribId || !multiDistribs) return;

    didFocusOnMultiDistribOnce.current = true;
    setFirstDistributionIndex(
      multiDistribs.findIndex((md) => md.id === focusedMultiDistribId),
    );
  }, [maxNbDistribToShow, focusedMultiDistribId, multiDistribs]);

  React.useEffect(() => {
    if (
      !!multiDistribs &&
      firstDistributionIndex + maxNbDistribToShow > multiDistribs.length
    ) {
      let adaptedIndex = multiDistribs.length - maxNbDistribToShow;

      setFirstDistributionIndex(adaptedIndex >= 0 ? adaptedIndex : 0);
    }
  }, [
    multiDistribs,
    firstDistributionIndex,
    maxNbDistribToShow,
    focusedMultiDistribId,
  ]);

  const onPreviousDistribution = () => {
    if (isAnimating || loading) return;
    setIsAnimating('right');
    setTimeout(() => {
      setFirstDistributionIndex(firstDistributionIndex - 1);
      if (firstDistributionIndex === 2) {
        loadMoreMultiDistribsBefore();
      }
      setIsAnimating(undefined);
    }, theme.transitions.duration.short);
  };
  const onNextDistribution = () => {
    if (isAnimating || loading) return;
    setIsAnimating('left');
    setTimeout(() => {
      setFirstDistributionIndex(firstDistributionIndex + 1);
      if (
        firstDistributionIndex + maxNbDistribToShow ===
        multiDistribs.length - 2
      ) {
        loadMoreMultiDistribsAfter();
      }
      setIsAnimating(undefined);
    }, theme.transitions.duration.short);
  };

  const slicedDistributions = React.useMemo(
    () =>
      multiDistribs?.slice(
        firstDistributionIndex > 0 ? firstDistributionIndex - 1 : 0,
        firstDistributionIndex + maxNbDistribToShow !== multiDistribs.length
          ? firstDistributionIndex + maxNbDistribToShow + 1
          : firstDistributionIndex + maxNbDistribToShow,
      ),
    [multiDistribs, firstDistributionIndex, maxNbDistribToShow],
  );

  const onBackClick = () => {
    goTo('/');
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!multiDistribs || !slicedDistributions || !data) {
    return <CircularProgressBox />;
  }

  return (
    <Box>
      <Block
        title={t('volunteersCalendar')}
        icon={<MediumActionIcon id={CamapIconId.calendar} />}
        sx={{
          height: '100%',
        }}
        contentSx={{
          p: {
            xs: 1,
            sm: 2,
          },
        }}
      >
        <Box
          mb={{
            xs: 1,
            sm: 2,
          }}
        >
          <Alert severity={done >= toBeDone ? 'success' : 'error'}>
            {t('yourParticipationToDuties')}
            {done < toBeDone && ` ${t('isNotEnough')}`} : <b>{done}</b>{' '}
            {t('dutyDoneOrPlannedOn', { count: done })} <b>{toBeDone}</b>{' '}
            {t('dutyToDo', { count: toBeDone })}{' '}
            <Typography variant="caption">
              (
              {`${tCommon('from')} ${formatAbsoluteDate(
                new Date(fromDate),
                false,
                false,
                true,
              )} ${tCommon('to')} ${formatAbsoluteDate(
                new Date(toDate),
                false,
                false,
                true,
              )}`}
              )
            </Typography>
          </Alert>
        </Box>
        {multiDistribs.length > 0 ? (
          <>
            <Box display="flex" flexDirection={'row'}>
              <Box
                width={{
                  xs: 'calc(100% - 150px)',
                  sm: 250,
                }}
                display="flex"
                alignItems="flex-end"
                justifyContent="center"
              >
                <Typography>{t('roles')}</Typography>
              </Box>
              <Box
                display="flex"
                flexDirection={'column'}
                flex={1}
                overflow="hidden"
                pt={0.5}
              >
                <Box
                  display="flex"
                  justifyContent="space-evenly"
                  flex={1}
                  minWidth={150}
                  position="relative"
                  sx={getSlideContainerSx(maxNbDistribToShow, 150, isAnimating)}
                >
                  {slicedDistributions.map((d, index) => (
                    <Box
                      key={`distribution_${d.id}`}
                      sx={{
                        ...getSlideItemSx(
                          maxNbDistribToShow,
                          150,
                          firstDistributionIndex,
                          multiDistribs?.length || 0,
                        ),
                      }}
                    >
                      <VolunteersCalendarDistribution
                        multiDistrib={d}
                        outline={
                          d.id === focusedMultiDistribId &&
                          index >= 1 &&
                          index < 1 + maxNbDistribToShow
                        }
                      />
                    </Box>
                  ))}
                </Box>
                <Box display={'flex'} justifyContent="space-evenly" mt={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onPreviousDistribution}
                    sx={{ minWidth: 'auto', width: 150 }}
                    disabled={
                      shouldDisableButton['previous'] &&
                      firstDistributionIndex === 0
                    }
                  >
                    <ArrowBack />
                  </Button>
                  {maxNbDistribToShow >= 3 && <Box width={150} />}
                  {maxNbDistribToShow >= 4 && <Box width={150} />}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onNextDistribution}
                    sx={{ minWidth: 'auto', width: 150 }}
                    disabled={
                      shouldDisableButton['next'] &&
                      firstDistributionIndex + maxNbDistribToShow ===
                      multiDistribs.length
                    }
                  >
                    <ArrowForward />
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box my={2}>
              {roles.map((r) => (
                <Box key={`role_${r.id}`}>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" flexDirection={'row'} mb={1}>
                    <Box
                      width={{
                        xs: 'calc(100% - 150px)',
                        sm: 250,
                      }}
                      display="flex"
                      alignItems={'center'}
                    >
                      <Typography>{r.name}</Typography>
                    </Box>

                    <Box display="flex" flex={1} overflow="hidden">
                      <Box
                        display="flex"
                        justifyContent="space-evenly"
                        flex={1}
                        alignItems="center"
                        sx={getSlideContainerSx(
                          maxNbDistribToShow,
                          150,
                          isAnimating,
                        )}
                      >
                        {slicedDistributions.map((d) => (
                          <Box
                            key={`order_${d.id}_${r.id}`}
                            height="100%"
                            sx={getSlideItemSx(
                              maxNbDistribToShow,
                              150,
                              firstDistributionIndex,
                              multiDistribs?.length || 0,
                            )}
                          >
                            <VolunteersCalendarDistributionRole
                              multiDistrib={d}
                              userId={userId}
                              roleId={r.id}
                              daysBeforeDutyPeriodsOpen={
                                daysBeforeDutyPeriodsOpen
                              }
                              returnUrl={`/distribution/volunteersCalendar${focusedMultiDistribId
                                  ? `/${focusedMultiDistribId}`
                                  : ''
                                }`}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Typography sx={{ fontStyle: 'italic' }}>
            {t('thereIsNoDistributionOnThisPeriod')}
          </Typography>
        )}

        <Box mt={2}>
          <BackButton onClick={onBackClick} />
        </Box>
      </Block>
    </Box>
  );
};

export default VolunteersCalendar;
