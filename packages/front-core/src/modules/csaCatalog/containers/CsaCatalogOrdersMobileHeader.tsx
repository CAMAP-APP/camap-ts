import { Box, Button } from "@mui/material"
import { ArrowBack, ArrowForward } from "@mui/icons-material"
import { formatAbsoluteDate } from "@utils/fomat"
import { formatCurrency } from "camap-common"
import { colorForDistributionState } from "../components/CsaCatalogDistribution"
import { Theme } from "@mui/material"
import { Typography } from "@mui/material"
import CamapIcon, { CamapIconId } from "../../../components/utils/CamapIcon"
import { useCallback, useContext } from "react"
import { CsaCatalogContext } from "../CsaCatalog.context"
import { RestDistributionEnriched, RestDistributionState } from "../interfaces"
import { useCamapTranslation } from "@utils/hooks/use-camap-translation"

export const CsaCatalogOrdersMobileHeader = (
    {
        distribution,
        onPreviousDistribution,
        onNextDistribution,
        distributionIndex,
        orders
    }: {
        distribution: RestDistributionEnriched,
        onPreviousDistribution: () => void,
        onNextDistribution: () => void,
        distributionIndex: number
        orders: Record<number, Record<number, number>>
    }) => {
    const { t } = useCamapTranslation(
        {
            t: 'csa-catalog',
        },
        true,
    );

    const {
        catalog,
        subscription,
        distributions
    } = useContext(CsaCatalogContext);

    const getTotalFromDistribution = useCallback(
        (distributionId: number) => {
            if (!orders) return 0;

            return formatCurrency(
                Object.keys(orders[distributionId]).reduce((acc, pid) => {
                    const product = catalog?.products.find(
                        (p) => p.id === parseInt(pid, 10),
                    );
                    if (!product) return acc;
                    const quantity = orders[distributionId][parseInt(pid, 10)];
                    acc += quantity * product.price;
                    return acc;
                }, 0),
            );
        },
        [catalog?.products, orders],
    );

    return (
        <Box
            sx={{
                position: {
                    xs: 'sticky',
                    sm: 'relative'
                },
                backgroundColor: t => t.palette.background.paper,
                top: 0,
                zIndex: 1030,
                boxShadow: t => t.shadows[3]
            }}>
            {/* Default order label */}
            {/* {displayDefaultOrder && (
                <Box key="default" display="flex" alignSelf="center">
                <span>{t('defaultOrder')}</span>
                </Box>
            )} */}

            {/* Distributions box & arrow buttons */}
            <Box
                display="flex"
                overflow="hidden"
            >
                {/* Arrow Prev */}
                <Button

                    variant="outlined"
                    size="small"
                    onClick={onPreviousDistribution}
                    disabled={distributionIndex === 0}
                >
                    <ArrowBack />
                </Button>

                {/* Distributions box */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-evenly"
                    flex={1}
                    position="relative"
                    sx={{
                        ...colorForDistributionState(distribution)
                    }}
                >
                    <Typography
                        textAlign="center"
                        fontWeight="bold"
                    >
                        {formatAbsoluteDate(
                            distribution.distributionStartDate,
                            false,
                            true,
                            true,
                        )}
                    </Typography>
                </Box>

                {/* Arrow Next */}
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onNextDistribution}
                    disabled={
                        distributionIndex >= distributions.length - 1
                    }
                >
                    <ArrowForward />
                </Button>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: '1fr 1fr',
                    lg: 'auto 1fr auto'
                }}
                gridTemplateAreas={{
                    xs: '"status status" "sold total"',
                    lg: '"sold status total"'
                }}
                gap={1}
                fontSize={{ xs: 14, sm: 16 }}
                justifyContent='space-between'
                mx={1}
                mb={1}
            >
                {/* Sold box */}
                <Box gridArea="sold" display="flex" alignItems="center" gap={1}>
                    <Box>
                        <Typography
                            fontSize="inherit"
                            fontWeight="bold"
                            lineHeight="1em"
                        >{t('paymentSold')}</Typography>
                    </Box>
                    {subscription !== undefined && <Box
                        sx={{
                            backgroundColor: (theme: Theme) =>
                                subscription.balance >= 0
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                        }}
                        p={1}
                    >
                        <Typography
                            fontSize="inherit"
                            fontWeight="bold"
                            sx={{
                                color: (theme) =>
                                    subscription.balance >= 0
                                        ? theme.palette.success.contrastText
                                        : theme.palette.error.contrastText,
                                textAlign: 'center',
                            }}
                        >
                            {formatCurrency(subscription.balance)}
                        </Typography>
                    </Box>}
                </Box>

                {/* Status, place and time */}
                <Box
                    gridArea="status"
                    display="flex" flexWrap={'wrap'} alignItems="center" justifyContent="center"
                    columnGap={2}
                    rowGap={0}
                    mt={1}
                >
                    <Typography variant="caption">
                        <CamapIcon id={CamapIconId.mapMarker} sx={{ verticalAlign: 'text-top' }} />
                        &nbsp;
                        {distribution.place.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        fontWeight={"bold"}
                    >
                        {distribution.state === RestDistributionState.Open &&
                            <>
                                <CamapIcon id={CamapIconId.calendar} sx={{ verticalAlign: 'text-top' }} />
                                &nbsp;
                                {t('orderBeforeThe', {
                                    date: formatAbsoluteDate(distribution.orderEndDate, true),
                                })}
                            </>}
                        {distribution.state === RestDistributionState.NotYetOpen &&
                            <>
                                <CamapIcon id={CamapIconId.calendar} sx={{ verticalAlign: 'text-top' }} />
                                &nbsp;
                                {t('orderOpenThe', {
                                    date: formatAbsoluteDate(distribution.orderStartDate, true),
                                })}
                            </>}
                        {distribution.state === RestDistributionState.Closed &&
                            <>
                                <CamapIcon id={CamapIconId.clock} sx={{ verticalAlign: 'text-top' }} />
                                &nbsp;
                                {t('orderClosed')}
                            </>}
                        {distribution.state === RestDistributionState.Absent && t('absent')}
                    </Typography>
                </Box>

                {/* Total */}
                <Box
                    gridArea="total"
                    display="flex"
                    gap={1}
                    alignItems="center"
                    justifyContent={"flex-end"}
                >
                    <Typography
                        fontSize="inherit"
                        fontWeight="bold"
                        lineHeight="1em"
                    >{t('orderValue')}</Typography>
                    <CamapIcon id={CamapIconId.basket} sx={{
                        color: 'primary.main'
                    }} />
                    <Typography
                        fontSize={{ xs: "1.1em", lg: "1.2em" }}
                        fontWeight="bold"
                        sx={{
                            color: 'primary.main'
                        }}
                    >{getTotalFromDistribution(distribution.id)}</Typography>
                </Box>
            </Box>
        </Box >
    )
}