import { useClaimVendorMutation, useGetClaimableVendorsQuery, useGetDefaultVendorByUserIdQuery, Vendor } from "@gql";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { PropsFrom } from "@utils/ts-react";
import { useState } from "react";
import { VendorImage } from "../../components/vendor/VendorImage";
import VendorsMergeMessage from "./VendorsMergeMessage";

export const VendorClaims = (
    props: {
        sx?: PropsFrom<typeof Box>['sx'],
        onClaim: (vendorId: number) => void
    }
) => {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const [claimingVendorId, setClaimingVendorId] = useState<number | null>(null);
    const [vendorToClaim, setVendorToClaim] = useState<Pick<Vendor, "id"|"name"|"companyNumber"|"image"> | null>(null);

    // Claimable Vendors
    const {
        data: { getClaimableVendors: claimableVendors } = {},
        loading: claimableVendorsLoading,
        error: claimableVendorsError,
        refetch: refetchClaimableVendors
    } = useGetClaimableVendorsQuery();

    const {
        data: { getDefaultVendorByUserId: defaultVendor } = {},
        refetch: refetchDefaultVendor,
    } = useGetDefaultVendorByUserIdQuery({
        variables: { userId: window._Camap.userId || -1 }
    });

    // Claim vendor mutation
    const [claimVendorMutation] = useClaimVendorMutation();

    const handleClaimButtonClick = (vendorId: number) => {
        setVendorToClaim(claimableVendors?.find(v => v.id === vendorId) ?? null);
    };

    const handleConfirmClaim = async () => {
        if (!vendorToClaim) return;
        
        try {
            setClaimingVendorId(vendorToClaim.id);
            await claimVendorMutation({
                variables: { vendorId: vendorToClaim.id },
            });
            
            refetchClaimableVendors();
            refetchDefaultVendor();
            props.onClaim(vendorToClaim.id);
            
        } catch (error) {
            console.error('Error claiming vendor:', error);
        } finally {
            setClaimingVendorId(null);
            setVendorToClaim(null);
        }
    };

    const handleCancelClaim = () => {
        setVendorToClaim(null);
    };

    if (
        claimableVendorsLoading ||
        claimableVendorsError ||
        claimableVendors && claimableVendors.length === 0
    ) {
        return <></>;
    }

    return <Box sx={{ ...props.sx }}>
        <Typography variant="h5" gutterBottom>{tVendorDash("yourEmailAssociatedVendors")}</Typography>
        <TableContainer component={Paper} sx={{
                '& ul, & li': { m: 0, p:0 },
                '& td:not(:last-child)': { pr: 1 }
            }}>
            <Table sx={{ minWidth: 650 }} size="small" padding="none">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>{tVendorDash("name")}</TableCell>
                        <TableCell sx={{ width: "115px" }} >{tVendorDash("vatNumber")}</TableCell>
                        <TableCell>{tVendorDash("groups")}</TableCell>
                        <TableCell>{tVendorDash("contracts")}</TableCell>
                        <TableCell sx={{ width: "200px" }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {claimableVendors?.map((vendor) => {
                        const groups = [...new Set(vendor.activeCatalogs?.map(catalog => catalog.group.name))];
                        return <TableRow key={vendor.id}>
                            <TableCell style={{ height: "100%", padding: 0, width: "50px", overflow: "hidden" }}>
                                <VendorImage vendor={vendor} width={"50px"} height={"50px"}/>
                            </TableCell>
                            <TableCell>{vendor.name}</TableCell>
                            <TableCell>{(vendor.companyNumber && vendor.companyNumber !== '') ? vendor.companyNumber : tVendorDash("unknownVAT")}</TableCell>
                            <TableCell>
                                {groups.length > 0
                                    ?   <List dense sx={{ maxHeight: "68px", overflowY: 'auto' }}>
                                        {groups.map(g => <ListItem key={g}>{g}</ListItem>)}
                                        </List>
                                    : tVendorDash("none")
                                }
                            </TableCell>
                            <TableCell>
                                {   vendor.activeCatalogs.length > 0
                                    ?   <List dense sx={{ maxHeight: "68px", overflowY: 'auto' }}>
                                        {vendor.activeCatalogs?.map(
                                            catalog => <ListItem key={catalog.id}>
                                                {tVendorDash('vendorCatalogListItem', {
                                                    catalogName: catalog.name,
                                                    subscriptionCount: catalog.subscriptionsCount || 0
                                                })}
                                            </ListItem>
                                        )}
                                        </List>
                                    : tVendorDash("none")
                                }
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: "flex", flexFlow: "column" }}>
                                    <Button variant='contained' color="warning" size="small"
                                        onClick={() => handleClaimButtonClick(vendor.id)}
                                        disabled={claimingVendorId === vendor.id}
                                    >
                                        {claimingVendorId === vendor.id ? tVendorDash("claiming") : tVendorDash("claim")}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={`mailto:${vendor.email}`}
                                    >
                                        <span className="glyphicon glyphicon-envelope" />&nbsp;{tVendorDash("contactGroups")}
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
        
        {/* Confirmation Dialog */}
        <Dialog
            open={vendorToClaim != null}
            closeAfterTransition={false}
            onClose={handleCancelClaim}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
                        {tVendorDash("confirmClaim")}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity="warning" sx={{ marginBottom: 2 }}>
                    <Typography variant="body2">
                        <strong>{tVendorDash("warning")}</strong> {tVendorDash("actionCannotBeUndone")}
                    </Typography>
                </Alert>
                <Alert severity="warning" sx={{ marginBottom: 2 }}>
                    <Typography variant="body2">
                        {tVendorDash("claimConfirmationMessage")}
                    </Typography>
                </Alert>
                <Alert severity="info" sx={{ marginBottom: 2 }}>
                    <Typography variant="body2">
                        {tVendorDash("claimConfirmationInfoRights")}
                    </Typography>
                </Alert>
                <Typography variant="h5">
                    {tVendorDash("claimConfirmationMerge")}
                </Typography>
                {defaultVendor && vendorToClaim && <VendorsMergeMessage
                    mergeTarget={defaultVendor}
                    mergedVendors={[vendorToClaim]}
                />}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCancelClaim}
                >
                    {tVendorDash("noCancel")}
                </Button>
                <Button 
                    onClick={handleConfirmClaim}
                    variant="contained"
                    color="primary"
                    disabled={claimingVendorId !== null}
                >
                    {claimingVendorId !== null ? tVendorDash("claiming") : tVendorDash("yesClaim")}
                </Button>
            </DialogActions>
        </Dialog>
    </Box>;
}