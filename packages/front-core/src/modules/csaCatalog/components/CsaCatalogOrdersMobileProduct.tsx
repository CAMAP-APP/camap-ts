import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import ProductLabels from "@components/utils/Product/ProductLabels";
import { Box, Button, Card, CardActionArea, CardContent, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { Colors } from "@theme/commonPalette";
import { formatPricePerUnit, formatStocks, formatUnit } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { formatCurrency, StockTracking, Unit } from "camap-common";
import { useCallback, useContext, useEffect, useState } from "react";
import { RestCsaCatalog } from "../interfaces";
import useStocks from "../containers/useStocks";
import { Distribution } from "@gql";
import { debounce } from "lodash";
import { CsaCatalogContext } from "../CsaCatalog.context";

function smartRound(v: number, unit: Unit) {
    if (v === undefined) return '';
    switch (unit) {
        // small unit, large numbers, no decimal
        case Unit.Centilitre:
        case Unit.Gram:
        case Unit.Millilitre:
        case Unit.Piece:
            return v.toFixed(0);
        // large unit, add 2 decimals
        case Unit.Kilogram:
        case Unit.Litre:
            return (Math.floor(v * 100) / 100).toString();
    }
}

const OrderControlsBulk = ({
    product,
    orderedQuantity,
    onQuantityChange,
    editable,
    max
}: {
    product: RestCsaCatalog['products'][number],
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void,
    editable: boolean,
    max?: number
}) => {

    const { t } = useCamapTranslation({
        t: "translation"
    })

    const [q, setQ] = useState(smartRound(orderedQuantity * product.qt, product.unitType));
    useEffect(() => {
        setQ(smartRound(orderedQuantity * product.qt, product.unitType));
    }, [orderedQuantity, product, max]);

    const onQuantityChangeDebounce = useCallback(
        (value: number) => debounce((v: number) => onQuantityChange(v), 100)(value),
        [onQuantityChange]
    );

    return <TextField
        size="small"
        disabled={!editable}
        inputProps={{
            style: {
                textAlign: 'right'
            }
        }}
        InputProps={{
            endAdornment: product.bulk
                ? <InputAdornment
                    position="end"
                >
                    {formatUnit(product.unitType, 1, t)}
                </InputAdornment>
                : undefined,
            sx: {
                fontSize: "0.8em",
                background: 'white',
                width: 80,
                flexGrow: 0
            }
        }}
        value={q}
        onChange={(
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            let v = parseFloat(event.target.value.replace(',', '.'));
            if (!isNaN(v) && v !== 0 && !event.target.value.endsWith(',') && !event.target.value.endsWith('.')) {
                let newValue = v / product.qt
                if (max !== undefined && newValue > max) newValue = max;
                setQ('' + (newValue * product.qt));
                onQuantityChangeDebounce(newValue);
            }
            else
                setQ(event.target.value.replace(/[^\d,.]/gm, ''))
        }}
        onClick={e => e.stopPropagation()}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            setTimeout(() => {
                let v = parseFloat(q) / product.qt;
                if (isNaN(v)) v = 0;
                if (max && v > max) v = max;
                onQuantityChangeDebounce(v);
            });
        }}
        hiddenLabel
    />
}

const OrderControlsUnit = ({
    orderedQuantity,
    onQuantityChange,
    editable,
    max
}: {
    product: RestCsaCatalog['products'][number],
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void,
    editable: boolean
    max?: number
}) => {

    const [q, setQ] = useState(orderedQuantity.toString());
    useEffect(() => {
        setQ(orderedQuantity.toString());
    }, [orderedQuantity]);

    const onQuantityChangeDebounce = useCallback(
        (value: number) => debounce((v: number) => onQuantityChange(v), 100)(value),
        [onQuantityChange]
    );

    if (orderedQuantity === 0) {
        // if there is no stock and with have nothing to return, no action available
        if (max !== undefined && max === 0)
            return null;
        return <Button
            onClick={() => onQuantityChangeDebounce(1)}
            sx={{
                visibility: editable ? 'visible' : 'hidden',
                fontSize: '20px',
                height: '35.4px',
                justifySelf: 'flex-end'
            }}
        >
            <CamapIcon id={CamapIconId.basketAdd} />
        </Button>
    }

    const btnProps = {
        flexGrow: 0,
        width: 25,
        minWidth: 25,
        height: "90%",
        minHeight: 25,
        m: "auto",
        p: 0,
    }

    return <Box
        display='flex'
        flexDirection='row'
        width={80}
    >
        <Button size='small' variant='contained' sx={{
            ...btnProps
        }}
            onClick={() => onQuantityChangeDebounce(orderedQuantity - 1)}
            disabled={!editable}
        >
            {"-"}
        </Button>
        <TextField
            sx={{ flexGrow: 1 }}
            size="small"
            disabled={!editable}
            inputProps={{
                style: {
                    textAlign: 'center',
                    paddingLeft: 0,
                    paddingRight: 0
                }
            }}
            InputProps={{
                sx: {
                    fontSize: "0.8em",
                    background: 'white',
                    textAlign: 'center'
                }
            }}
            value={q}
            onChange={(
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                const newValue = parseInt(event.target.value);
                if (!isNaN(newValue) && newValue !== 0)
                    onQuantityChangeDebounce(max !== undefined ? Math.min(newValue, max) : newValue);
                else
                    setQ(event.target.value.replace(/[^\d]/gm, ''))
            }
            }
            onBlur={() => {
                const newValue = parseInt(q);
                if (!isNaN(newValue))
                    onQuantityChangeDebounce(max !== undefined ? Math.min(newValue, max) : newValue);
            }}
            hiddenLabel
        />
        <Button size='small' variant='contained' sx={{
            ...btnProps
        }}
            disabled={!editable || (max !== undefined && orderedQuantity >= max)}
            onClick={() => onQuantityChange(orderedQuantity + 1)}
        >
            {"+"}
        </Button>
    </Box>
}

const OrderControls = ({
    product,
    ...props
}: {
    product: RestCsaCatalog['products'][number],
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void
    editable: boolean,
    max?: number
}) => {
    return product.bulk
        ? <OrderControlsBulk product={product} {...props} />
        : <OrderControlsUnit product={product} {...props} />
}

function CsaCatalogOrdersMobileProduct({
    product,
    orderedQuantity,
    onClick,
    onQuantityChange,
    editable,
    distribution,
    defaultOrdersMode
}: {
    product: RestCsaCatalog['products'][number],
    orderedQuantity: number,
    onClick: () => void,
    onQuantityChange: (quantity: number) => void,
    editable: boolean
    distribution: Distribution
    defaultOrdersMode: boolean
}
) {

    const { t } = useCamapTranslation({
        t: "csa-catalog"
    });

    const [stocks] = useStocks(product, defaultOrdersMode ? undefined : distribution);

    const { remainingDistributions } = useContext(CsaCatalogContext);

    const showStocks = product.stockTracking !== StockTracking.Disabled && stocks != null;

    const formattedStocks = stocks != null ? formatStocks(stocks, product.qt, product.unitType, product.variablePrice, product.bulk) : null;
    const stockFactor = defaultOrdersMode && product.stockTracking === StockTracking.Global ? remainingDistributions : 1;
    const max = showStocks ? (Math.floor((stocks) / stockFactor) + orderedQuantity) : undefined

    return <Card
        sx={{
            position: 'relative',
            width: '100%',
            minWidth: 0,
            maxWidth: 180,
            flexBasis: 150,
            flexGrow: 1
        }}
        elevation={3}
    >
        <CardActionArea onClick={onClick}>
            <Box sx={{ position: 'relative' }}>
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    aspectRatio: 1,
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: "-5%",
                        left: "-5%",
                        width: '110%',
                        height: '110%',
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'repeat',
                        filter: 'blur(5px)'
                    }} />
                    <img
                        src={product.image}
                        alt=""
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                }}>
                    <ProductLabels product={product} />
                </Box>
                {showStocks &&
                    <Box sx={{
                        position: 'absolute',
                        left: 4,
                        bottom: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                        background: t => Colors.background3
                    }}>
                        <Tooltip title={
                            product.stockTracking === StockTracking.Global
                                ? t('stockCount', { stock: formattedStocks })
                                : t('stockCountPerDistribution', { stock: formattedStocks })
                        }>
                            <Box display='flex' flexDirection='row' gap={1} py={0.2} px={0.5} alignItems='center'>
                                <CamapIcon id={CamapIconId.stock} sx={{ fontSize: '1.2em' }} />
                                <Typography fontSize="0.9em">
                                    {
                                        formattedStocks
                                    }
                                    {defaultOrdersMode && product.stockTracking !== StockTracking.Global && stocks > 0 && <>
                                        {' / '}
                                        <CamapIcon id={CamapIconId.distribution} sx={{ verticalAlign: 'baseline', fontSize: '0.9em' }} />
                                    </>}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                }
            </Box>
            <CardContent
                sx={{
                    background: t => Colors.background3,
                    px: 1,
                    pt: 1,
                    pb: 0
                }}
            >
                <Box sx={{
                    textTransform: "uppercase"
                }}>
                    <Typography fontSize="0.7em" noWrap width="100%" fontWeight="bold" sx={{ minWidth: 0 }}>
                        {product.name}
                    </Typography>
                </Box>
                <Box display='flex' justifyContent='flex-end' width='100%'>
                    <Typography fontSize="0.7em" noWrap fontWeight="bold" color='primary.main' visibility={orderedQuantity > 0 ? 'visible' : 'hidden'}>
                        {formatCurrency(product.price * orderedQuantity)}
                    </Typography>
                </Box>
            </CardContent>
        </CardActionArea>
        <Box display='flex'
            flexDirection='row'
            justifyContent='space-between'
            p={0}
            gap="4px"
            sx={{
                background: t => Colors.background3
            }}
            alignItems='flex-end'
        >
            <Box sx={{
                fontSize: "0.6em",
                minWidth: 66,
                pl: 1,
                pb: 1
            }}>
                <Box sx={{
                    fontWeight: "bold"
                }}>
                    {!product.bulk && product.unitType !== Unit.Piece &&
                        `${product.variablePrice ? '≈' : ``}${product.qt}${formatUnit(product.unitType)}`
                    }
                </Box>
                <Box>
                    {formatPricePerUnit(
                        product.price,
                        product.qt,
                        product.unitType,
                        undefined,
                        t
                    )}
                </Box>
            </Box>
            <Box sx={{
                justifySelf: 'flex-end',
                minWidth: 80,
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <OrderControls
                    editable={editable}
                    product={product}
                    orderedQuantity={orderedQuantity}
                    max={max}
                    onQuantityChange={onQuantityChange} />
            </Box>
        </Box>
    </Card >
}

export default CsaCatalogOrdersMobileProduct;