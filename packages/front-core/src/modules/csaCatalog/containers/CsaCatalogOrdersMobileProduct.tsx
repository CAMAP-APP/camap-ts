import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import ProductLabels from "@components/utils/Product/ProductLabels";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { Colors } from "@theme/commonPalette";
import { formatPricePerUnit, formatStocks, formatUnit } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { formatCurrency, StockTracking, Unit } from "camap-common";
import { useCallback, useEffect, useState } from "react";
import { RestCsaCatalog } from "../interfaces";
import useStocks from "./useStocks";
import { Distribution } from "@gql";
import { debounce } from "lodash";

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
            console.log(event.target.value, v);
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

    if (orderedQuantity === 0)
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
    return <Box
        display='flex'
        flexDirection='row'
        width={80}
    >
        <Button size='small' variant='contained' sx={{
            flexGrow: 0,
            width: 25,
            minWidth: 25,
            minHeight: 25,
            m: 0,
            p: 0,
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
            flexGrow: 0,
            width: 25,
            minWidth: 25,
            minHeight: 25,
            m: 0,
            p: 0
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

    const [stocks] = useStocks(product, distribution);

    const showStocks = !defaultOrdersMode && product.stockTracking !== StockTracking.Disabled && stocks != null;

    return <Card
        sx={{
            position: 'relative',
            minWidth: 150,
            maxWidth: 180,
            flexBasis: 150,
            flexGrow: 1
        }}
        elevation={3}
    >
        <CardActionArea onClick={onClick}>
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={product.image}
                    alt=""
                />
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
                        <Tooltip title={t('stockCount', { stock: formatStocks(stocks, product.qt, product.unitType, product.variablePrice, product.bulk) })}>
                            <Box display='flex' flexDirection='row' gap={1} py={0.2} px={0.5} alignItems='center'>
                                <CamapIcon id={CamapIconId.wholesale} sx={{ fontSize: '1.2em' }} />
                                <Typography fontSize="0.9em">{
                                    formatStocks(stocks, product.qt, product.unitType, product.variablePrice, product.bulk)}</Typography>
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
                    <Typography fontSize="0.7em" noWrap width="100%" fontWeight="bold">
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
                    {!product.bulk && product.unitType !== Unit.Piece && `${product.qt}${formatUnit(product.unitType)}`}
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
                    max={showStocks ? (stocks + orderedQuantity) : undefined}
                    onQuantityChange={onQuantityChange} />
            </Box>
        </Box>
    </Card >
}

export default CsaCatalogOrdersMobileProduct;