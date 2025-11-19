import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import ProductLabels from "@components/utils/Product/ProductLabels";
import { Product } from "@gql";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, InputAdornment, TextField, Typography } from "@mui/material";
import { Colors } from "@theme/commonPalette";
import { formatPricePerUnit, formatUnit } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { Unit } from "camap-common";
import { useEffect, useState } from "react";

function smartRound(v: number, unit: Unit) {
    if(v === undefined) return '';
    switch(unit) {
        // small unit, large numbers, no decimal
        case Unit.Centilitre:
        case Unit.Gram:
        case Unit.Millilitre:
        case Unit.Piece:
            return v.toFixed(0);
        // large unit, add 2 decimals
        case Unit.Kilogram:
        case Unit.Litre:
            return (Math.floor(v*100)/100).toString();
    }
}

const OrderControlsBulk = ({
    product,
    orderedQuantity,
    onQuantityChange
}:{
    product: Product,
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void
}) => {

    const { t } = useCamapTranslation({
        t: "translation"
    })

    const [q, setQ] = useState(smartRound(orderedQuantity*product.qt, product.unitType));
    useEffect(() => {
        setQ(smartRound(orderedQuantity*product.qt, product.unitType));
    }, [orderedQuantity, product]);

    return <TextField
        size="small"
        inputProps={{
            type: 'number',
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
                if(!isNaN(parseFloat(event.target.value)))
                    onQuantityChange(
                        parseFloat(event.target.value)/product.qt
                    )
                else
                    setQ(event.target.value)
            }
        }
        onClick={e => e.stopPropagation()}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) =>
            event.target.value = (orderedQuantity*product.qt).toString()
        }
        hiddenLabel
    />
}

const OrderControlsUnit = ({
    orderedQuantity,
    onQuantityChange
}:{
    product: Product,
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void
}) => {

    const [q, setQ] = useState(orderedQuantity.toString());
    useEffect(() => {
        setQ(orderedQuantity.toString());
    }, [orderedQuantity]);

    if(orderedQuantity === 0)
        return <Button
            onClick={() => onQuantityChange(1)}
            sx={{
                fontSize: '20px',
                height: '35.4px'
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
            onClick={() => onQuantityChange(orderedQuantity-1)}
        >
            {"-"}
        </Button>
        <TextField
            sx={{ flexGrow: 1 }}
            size="small"
            inputProps={{
                type: 'number',
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
                    const q = parseInt(event.target.value);
                    if(!isNaN(q))
                        onQuantityChange(q);
                    else
                        setQ(event.target.value)
                }
            }
            onBlur={() => {
                onQuantityChange(parseInt(q))
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
            onClick={() => onQuantityChange(orderedQuantity+1)}
        >
            {"+"}
        </Button>
    </Box>
}

const OrderControls = ({
    product,
    ...props
}:{
    product: Product,
    orderedQuantity: number,
    onQuantityChange: (quantity: number) => void
}) => {
    return product.bulk 
        ? <OrderControlsBulk product={product} {...props} />
        : <OrderControlsUnit product={product} {...props} />
}

function CsaCatalogOrdersMobileProduct({
    product,
    orderedQuantity,
    onClick,
    onQuantityChange
}:{
    product: Product,
    orderedQuantity: number,
    onClick: () => void,
    onQuantityChange: (quantity: number) => void
}
) {

    const { t } = useCamapTranslation({
        t: "translation"
    });

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
            <CardMedia
                component="img"
                image={product.image}
                alt=""
            />
            <Box sx={{
                position: 'absolute',
                top: 4,
                left: 4
            }}>
                <ProductLabels product={product} />
            </Box>
            <CardContent
                sx={{
                    background: t => Colors.background3,
                    p: 1
                }}
            >
                <Box sx={{
                    textTransform: "uppercase"
                }}>
                    <Typography fontSize="0.7em" noWrap width="100%" fontWeight="bold">
                        {product.name}
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
                minWidth: 80
            }}>
                <OrderControls product={product} orderedQuantity={orderedQuantity} onQuantityChange={onQuantityChange} />
            </Box>
        </Box>
    </Card>
}

export default CsaCatalogOrdersMobileProduct;