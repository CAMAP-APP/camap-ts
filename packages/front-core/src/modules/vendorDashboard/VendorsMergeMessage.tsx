import { Vendor } from "@gql";
import { CheckCircle, Delete, Link } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";

const VendorsMergeMessage = (props:{
    mergeTarget: Pick<Vendor, "id" | "name" | "image" | "companyNumber">,
    mergedVendors: Pick<Vendor, "id" | "name" | "image" | "companyNumber">[]
}) => {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    return <>
        {/* Selected Vendor Profile */}
        {props.mergeTarget && (
            <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                <Typography variant="h6" color="success.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ marginRight: 1 }} />
                    {tVendorDash("profileToKeep")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {props.mergeTarget.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {props.mergeTarget.companyNumber ?? tVendorDash("unknownVatNumber")}
                </Typography>
            </Box>
        )}
        
        {/* Vendors to be deleted */}
        {props.mergedVendors && props.mergeTarget && (
            <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                <Typography variant="h6" color="error.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                    <Delete sx={{ marginRight: 1 }} />
                    {tVendorDash("profilesToBeRemoved")}
                </Typography>
                {props.mergedVendors
                    .filter(v => v.id !== props.mergeTarget.id)
                    .map(vendor => (
                        <Box key={vendor.id} sx={{ marginBottom: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {vendor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {vendor.companyNumber ?? tVendorDash("unknownVatNumber")}
                            </Typography>
                        </Box>
                    ))}
            </Box>
        )}
        
        {/* Total contracts to be reattached */}
        {props.mergedVendors && props.mergeTarget && (
            <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                <Typography variant="h6" color="info.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                    <Link sx={{ marginRight: 1 }} />
                    {tVendorDash("contractsToBeReattached", {
                        nbCatalogsMoved: props.mergedVendors
                            .filter(v => v.id !== props.mergeTarget.id)
                            .reduce((total: number, vendor: any) => total + vendor.catalogs?.length, 0),
                        nbSubsMoved: props.mergedVendors
                            .filter(v => v.id !== props.mergeTarget.id)
                            .reduce((total: number, vendor: any) => 
                                total + (vendor.catalogs?.reduce((catalogTotal: number, catalog: any) => 
                                    catalogTotal + (catalog.subscriptionsCount || 0), 0) || 0), 0
                        ),
                        vendor: props.mergeTarget.name
                    })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {tVendorDash("contractsToBeReattachedGroups")}
                    &nbsp;
                    {[...props.mergedVendors
                        .filter(v => v.id !== props.mergeTarget.id)
                        .reduce(
                            (groups: Set<string>, vendor: any) => vendor.catalogs?.reduce((groups: Set<string>, c: any) => groups.add(c.group.name), groups),
                            new Set<string>())
                    ].map((groupName, i) => <span key={`group-${i}`}>
                            <i className="icon icon-users" style={{ marginRight: "5px" }} />
                            {groupName}
                        </span>)
                    }
                </Typography>
            </Box>
        )}
    </>
}

export default VendorsMergeMessage;