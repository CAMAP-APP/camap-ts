import CircularProgressBox from "@components/utils/CircularProgressBox";
import { useVendorCatalogsQuery, VendorCatalogsQuery } from "@gql";
import { Alert, Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useMemo } from "react";

type VendorCatalog = VendorCatalogsQuery["vendor"]["allCatalogs"][number];
type VendorGroup = NonNullable<VendorCatalog["group"]>;

type CatalogsByGroup = {
    group: VendorGroup;
    catalogs: VendorCatalog[];
};

function groupCatalogsByGroup(catalogs: VendorCatalog[]): CatalogsByGroup[] {
    const byGroup = catalogs.reduce((acc, catalog) => {
        if (!catalog.group) {
            return acc;
        }

        const existing = acc.get(catalog.group.id) ?? { group: catalog.group, catalogs: [] as VendorCatalog[] };
        existing.catalogs.push(catalog);
        acc.set(catalog.group.id, existing);
        return acc;
    }, new Map<number, CatalogsByGroup>());

    return Array.from(byGroup.values())
        .map(({ group, catalogs }) => ({
            group,
            catalogs: [...catalogs].sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.group.name.localeCompare(b.group.name));
}

function CatalogListItem({ catalog, catalogIndex }: { catalog: VendorCatalog, catalogIndex: number }) {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    return (
        <Box key={catalog.id}>
            {catalogIndex > 0 && <Divider />}
            <ListItemButton
                sx={{ px: 0 }}
                href={`/user/choose?group=${catalog.group.id}&redirect=/contractAdmin/view/${catalog.id}`}
            >
                <ListItemText
                    primary={tVendorDash("vendorCatalogListItem", {
                        catalogName: catalog.name,
                        subscriptionCount: catalog.subscriptionsCount ?? 0,
                    })}
                />
            </ListItemButton>
        </Box>
    )
}

function VendorContracts({ vendorId }: { vendorId: number }) {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const {
        data: { vendor } = {},
        loading,
        error,
    } = useVendorCatalogsQuery({
        variables: { vendorId },
    });

    const { activeGroups, inactiveGroups } = useMemo(() => {
        const activeCatalogs = vendor?.activeCatalogs ?? [];
        const allCatalogs = vendor?.allCatalogs ?? [];

        const activeCatalogIds = new Set(activeCatalogs.map((c) => c.id));
        const inactiveCatalogs = allCatalogs.filter((c) => !activeCatalogIds.has(c.id));

        return {
            activeGroups: groupCatalogsByGroup(activeCatalogs),
            inactiveGroups: groupCatalogsByGroup(inactiveCatalogs),
        };
    }, [vendor?.activeCatalogs, vendor?.allCatalogs]);

    if (loading) {
        return <CircularProgressBox />;
    }

    if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>
                    {tVendorDash("contractsActiveTitle")}
                </Typography>

                {activeGroups.length === 0 ? (
                    <Typography>{tVendorDash("contractsActiveEmpty")}</Typography>
                ) : (
                    activeGroups.map(({ group, catalogs }, groupIndex) => (
                        <Box key={group.id} sx={{ mt: groupIndex === 0 ? 0 : 2 }}>
                            <Typography variant="h5" gutterBottom>
                                {tVendorDash("inGroupGroupName", { groupName: group.name })}
                            </Typography>
                            <List dense disablePadding>
                                {catalogs.map((catalog, catalogIndex) => (
                                    <CatalogListItem key={catalog.id} catalog={catalog} catalogIndex={catalogIndex} />
                                ))}
                            </List>
                        </Box>
                    ))
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>
                    {tVendorDash("contractsInactiveTitle")}
                </Typography>

                {inactiveGroups.length === 0 ? (
                    <Typography>{tVendorDash("contractsInactiveEmpty")}</Typography>
                ) : (
                    inactiveGroups.map(({ group, catalogs }, groupIndex) => (
                        <Box key={group.id} sx={{ mt: groupIndex === 0 ? 0 : 2 }}>
                            <Typography variant="h5" gutterBottom>
                                {tVendorDash("inGroupGroupName", { groupName: group.name })}
                            </Typography>
                            <List dense disablePadding>
                                {catalogs.map((catalog, catalogIndex) => (
                                    <CatalogListItem key={catalog.id} catalog={catalog} catalogIndex={catalogIndex} />
                                ))}
                            </List>
                        </Box>
                    ))
                )}
            </Paper>
        </Box>
    );
}

export default VendorContracts;
