import { useClaimVendorMutation, useGetClaimableVendorsQuery, useGetDefaultVendorByUserIdQuery, Vendor } from "@gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";
import { VendorImage } from "../../components/vendor/VendorImage";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, styled, Typography } from "@mui/material";
import VendorsMergeMessage from "./VendorsMergeMessage";

const TD = styled(Box)(({ theme }) => ({
    display: "flex",
    flexFlow: "row",
    gap: "0.2em",
    justifyContent: "flex-end",
    padding: '0 !important',
    [theme.breakpoints.down("md")]: {
        flexFlow: "column"
    }
}))

export const VendorClaims = (
    props: {
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

    return <Box>
        <Typography variant="h5">{tVendorDash("yourEmailAssociatedVendors")}</Typography>
        <table className="table">
            <thead>
                <tr>
                    <th />
                    <th>{tVendorDash("name")}</th>
                    <th>{tVendorDash("vatNumber")}</th>
                    <th>{tVendorDash("groups")}</th>
                    <th>{tVendorDash("contracts")}</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {claimableVendors?.map((vendor) => (
                    <tr key={vendor.id}>
                        <td style={{ height: "100%", padding: 0, width: "50px", overflow: "hidden" }}>
                            <VendorImage vendor={vendor} width={"50px"} height={"50px"}/>
                        </td>
                        <td>{vendor.name}</td>
                        <td>{vendor.companyNumber ?? tVendorDash("unknown")}</td>
                        <td>
                            {[...new Set(vendor.catalogs?.map(catalog => catalog.group.name))]
                                .filter(Boolean)
                                .join(", ") || tVendorDash("none")}
                        </td>
                        <td>
                            {   vendor.catalogs
                                ? <ul>
                                    {vendor.catalogs?.map(
                                        catalog => <li key={catalog.id}>
                                            {tVendorDash('vendorCatalogListItem', {
                                                catalogName: catalog.name,
                                                subscriptionCount: catalog.subscriptionsCount || 0
                                            })}
                                        </li>
                                    )}
                                    </ul>
                                : tVendorDash("none")
                            }
                        </td>
                        <TD component="td">
                            <Button variant='contained' color="warning"
                                onClick={() => handleClaimButtonClick(vendor.id)}
                                disabled={claimingVendorId === vendor.id}
                            >
                                {claimingVendorId === vendor.id ? tVendorDash("claiming") : tVendorDash("claim")}
                            </Button>
                            <Button
                                variant="outlined"
                                className="btn btn-sm btn-primary" 
                                href={`mailto:${vendor.email}`}
                            >
                                <span className="glyphicon glyphicon-envelope" />&nbsp;{tVendorDash("contactGroups")}
                            </Button>
                        </TD>
                    </tr>
                ))}
            </tbody>
        </table>
        
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