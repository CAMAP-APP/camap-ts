import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { GetNextVendorDistributionsQuery, useGetNextVendorDistributionsQuery } from "@gql";
import { Alert, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { formatDate, formatTime } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { formatSmartQt } from "camap-common";
import { startOfDay } from "date-fns";
import { useMemo, useState } from "react";

type VendorDistributions = GetNextVendorDistributionsQuery['vendor']['nextDistributions'][number];
type ProductLike = {
    id: number,
    name: string,
    qt: number,
    unitType: number,
    variablePrice: boolean,
    bulk: boolean
}

const MultiDistribRow = ({ distributions }: { distributions: VendorDistributions['distributions']}) => {

    // const { tUnit } = useCamapTranslation({ tUnit: 'unit' });
    const products = distributions.reduce((products, d) => {

        for(const order of d.userOrders) {
            let p = products.get(order.product.id) ?? {
                ...order.product,
                ordered: 0,
                group: d.catalog.group,
                catalog: d.catalog,
                distribution: d
            };
            p.ordered += order.quantity;
            products.set(p.id, p);
        }

        return products;
    }, new Map<number, ProductLike & {
        ordered: number,
        group: { id: number },
        catalog: VendorDistributions['distributions'][number]['catalog'],
        distribution: VendorDistributions['distributions'][number]}
    >())

    return <>
        <TableRow>
            <TableCell colSpan={2} sx={{
                background: theme => theme.palette.grey[100],
                fontWeight: 'bold',
                p: 1
            }}>
                {formatTime(distributions[0].date)}&nbsp;{distributions[0].place.name}
            </TableCell>
        </TableRow>
        {Array.from(products.values()).map(p => 
            <TableRow key={p.id}>
                <TableCell>
                    {formatSmartQt(p, {quantity: p.ordered}, { forceShowSingleUnit: true })}
                </TableCell>
                <TableCell>
                    <a href={`/user/choose?group=${distributions[0].catalog.group.id}&redirect=/contractAdmin/distributions/${distributions[0].catalog.id}`}>
                        <Typography>{p.catalog.name}</Typography>
                    </a>
                </TableCell>
            </TableRow>
        )}
    </>
}

const DistributionByGroupDateRow = ({
    group, distributions
}: VendorDistributions) => {

    const multiDistribs = distributions.reduce((md, d) => {
        const dists = md.get(d.multiDistrib.id) ?? [];
        dists.push(d);
        md.set(d.multiDistrib.id, dists);
        return md;
    }, new Map<number, typeof distributions>)

    return <>
        <TableRow>
            <TableCell colSpan={3}>
                <Typography variant="h6">
                    <a href={`/user/choose?group=${group.id}&redirect=/contractAdmin`}>{group.name}</a>
                </Typography>
            </TableCell>
        </TableRow>
        {Array.from(multiDistribs.entries()).map(([id, distributions]) => 
            <MultiDistribRow key={id} distributions={distributions} />
        )}
    </>
}

const DistributionByDateRow = ({ date, groups, forceOpen=false }: {
    date: Date,
    groups: Map<number, VendorDistributions>,
    forceOpen?: boolean
}) => {
    const [open, setOpen] = useState(forceOpen);
    
    return <>
    <TableRow sx={{ '& > td': { borderBottom: 'unset' } }}>
        <TableCell sx={{ width: 20 }}>
            <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    <CamapIcon id={open ? CamapIconId.chevronDown : CamapIconId.chevronRight} />
                </IconButton>
            </TableCell>
        <TableCell colSpan={1}>
            <Typography variant="h5">{formatDate(date)}</Typography>
        </TableCell>
    </TableRow>
    <TableRow>
        <TableCell colSpan={2} sx={{ p: 0 }}>
            <Collapse in={open}>
                <Table>
                    <TableBody>
                    {Array.from(groups.values()).map(g =>
                        <DistributionByGroupDateRow key={g.group.id} group={g.group} distributions={g.distributions} />
                    )}
                    </TableBody>
                </Table>
            </Collapse>
        </TableCell>
    </TableRow>
    </>
}

function VendorDashDistributions({ vendorId }:{ vendorId: number }) {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const {
        data: { vendor: { nextDistributions = [] } = {} } = {},
        loading,
        error
    } = useGetNextVendorDistributionsQuery({ variables: { vendorId }});
    

    const distributionsByDateAndGroup = useMemo(() => nextDistributions.reduce(
        (byDate, c) => {

            c.distributions.forEach(d => {
                const date = startOfDay(d.date);
                const groupsForDate = byDate.get(date.getTime()) ?? new Map<number, VendorDistributions>();
                const dists = groupsForDate.get(d.catalog.group.id) ?? { group: c.group, distributions: [] };
                dists?.distributions.push(d);
                groupsForDate.set(c.group.id, dists);
                byDate.set(date.getTime(), groupsForDate);
            })

            return byDate;
        },
        new Map<number, Map<number, VendorDistributions>>
    ), [nextDistributions]);

    return <Paper sx={{ padding: 1 }}>
        <Typography variant="h5">{tVendorDash("dashDistributionsTitle")}</Typography>
        {!loading && !error && <Table>
            <TableBody>
            {Array.from(distributionsByDateAndGroup.entries())
                .sort(([d1], [d2]) => d1 - d2)
                .map(([date, groups], i) => <DistributionByDateRow
                    key={date}
                    date={new Date(date)}
                    groups={groups}
                    forceOpen={i === 0}
                />)
            }
            </TableBody>
        </Table>}
        {loading && <CircularProgressBox />}
        {error && <Alert severity="error">{error.message}</Alert>}
    </Paper>

}

export default VendorDashDistributions;