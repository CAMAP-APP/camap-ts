import { VendorClaims } from "./VendorClaims";
import { 
    CircularProgress, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Alert,
    Typography,
    Box
} from "@mui/material";
import { CheckCircle, Delete, Link } from "@mui/icons-material";
import { useGetVendorsByUserIdQuery, useUserAccountQuery, useConsolidateVendorsMutation } from "@gql";
import { useState } from "react";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";

const VendorDashboard = () => {

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });
    const [consolidatingVendorId, setConsolidatingVendorId] = useState<number | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    const {
        data: userData,
        loading: userLoading,
        error: userError,
    } = useUserAccountQuery();

    // Check if user has claimed vendors (using minimal query)
    const {
        data: { getVendorsByUserId: claimedVendors } = {},
        loading: claimedVendorsLoading,
        error: claimedVendorsError,
        refetch: refetchClaimedVendors,
    } = useGetVendorsByUserIdQuery({
        variables: { userId: userData?.me?.id || -1 },
        skip: !userData?.me?.id,
    });

    // Consolidate vendors mutation
    const [consolidateVendorsMutation] = useConsolidateVendorsMutation();

    const handleVendorSelection = (vendorId: number) => {
        const vendor = claimedVendors?.find(v => v.id === vendorId);
        setSelectedVendorId(vendorId);
        setSelectedVendor(vendor);
        setShowConfirmationModal(true);
    };

    const handleConfirmConsolidation = async () => {
        if (!selectedVendorId) return;
        
        try {
            setConsolidatingVendorId(selectedVendorId);
            await consolidateVendorsMutation({
                variables: { vendorId: selectedVendorId },
            });
            
            // Refetch the vendors list to show the updated state
            refetchClaimedVendors();
            
        } catch (error) {
            console.error('Error consolidating vendors:', error);
        } finally {
            setConsolidatingVendorId(null);
            setShowConfirmationModal(false);
            setSelectedVendorId(null);
            setSelectedVendor(null);
        }
    };

    const handleCancelConsolidation = () => {
        setShowConfirmationModal(false);
        setSelectedVendorId(null);
        setSelectedVendor(null);
    };

    if (userLoading || claimedVendorsLoading) {
        return <CircularProgress />;
    }

    if (userError || claimedVendorsError || !claimedVendors) {
        return <></>;
    }

    const claims = <VendorClaims onClaim={() => {refetchClaimedVendors()}} />

    if(claimedVendors?.length < 1) {
        return <>
            <h4>{tVendorDash("noVendorProfiles")}</h4>

            {claims}
        </>
    }
    
    if(claimedVendors?.length > 1) {
        return <>
            <h4>{tVendorDash("multipleVendorProfiles")}</h4>
            <p>{tVendorDash("chooseUniqueProfile")}</p>

            <div className="col-md-12">
                <div className="row">
                    {claimedVendors?.map(vendor => <div className="col-md-4"
                        style={{flex: "1 0 auto"}}
                        key={`vendor-${vendor.id}`}>
                        <div className="panel panel-default" style={{ marginBottom: "15px" }}>
                            <div className="panel-body text-center">
                                <div style={{ marginBottom: "10px" }}>
                                    { vendor.image 
                                    ? <img 
                                            src={vendor.image} 
                                            className="img-responsive" 
                                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", margin: "0 auto", }}
                                            alt={vendor.name} 
                                        />
                                    : <div 
                                        style={{ 
                                            width: "80px", 
                                            height: "80px", 
                                            backgroundColor: "#f0f0f0", 
                                            borderRadius: "4px",
                                            margin: "0 auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }} 
                                    >
                                        <i className="icon icon-farmer" style={{ fontSize: "24px", color: "#999" }} />
                                    </div>
                                    }
                                </div>
                                
                                <h4 style={{ margin: "10px 0 5px 0", fontSize: "16px", fontWeight: "bold" }}>
                                    {vendor.name}
                                </h4>
                                
                                <div style={{ marginBottom: "8px" }}>
                                    <small className="text-muted">
                                        <i className="icon icon-file-text" style={{ marginRight: "5px" }} />
                                        {vendor.companyNumber ?? tVendorDash("unknownVatNumber")}
                                    </small>
                                </div>
                                
                                <div style={{ marginBottom: "15px" }}>
                                    <small>
                                        <i className="icon icon-users" style={{ marginRight: "5px" }} />
                                        {[...new Set(vendor.catalogs?.map(catalog => catalog.group.name))]
                                            .filter(Boolean)
                                            .join(", ") || tVendorDash("none")}
                                    </small>
                                </div>
                                
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleVendorSelection(vendor.id)}
                                    style={{ width: "100%" }}
                                >
                                    <i className="icon icon-check" style={{ marginRight: "5px" }} />
                                    {tVendorDash("chooseThisProfile")}
                                </button>
                            </div>
                        </div>
                    </div>)}
        {/* Confirmation Modal */}
        <Dialog 
            open={showConfirmationModal} 
            onClose={handleCancelConsolidation}
            closeAfterTransition={false}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                        {tVendorDash("confirmVendorConsolidation")}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity="warning" sx={{ marginBottom: 2 }}>
                    <Typography variant="body2">
                        <strong>{tVendorDash("warning")}</strong> {tVendorDash("actionCannotBeUndone")}
                    </Typography>
                </Alert>
                
                {/* Selected Vendor Profile */}
                {selectedVendor && (
                    <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                        <Typography variant="h6" color="success.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                            <CheckCircle sx={{ marginRight: 1 }} />
                            {tVendorDash("profileToKeep")}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {selectedVendor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedVendor.companyNumber ?? tVendorDash("unknownVatNumber")}
                        </Typography>
                    </Box>
                )}
                
                {/* Vendors to be deleted */}
                {claimedVendors && selectedVendor && (
                    <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                        <Typography variant="h6" color="error.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                            <Delete sx={{ marginRight: 1 }} />
                            {tVendorDash("profilesToBeRemoved")}
                        </Typography>
                        {claimedVendors
                            .filter(v => v.id !== selectedVendor.id)
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
                {claimedVendors && selectedVendor && (
                    <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                        <Typography variant="h6" color="info.main" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                            <Link sx={{ marginRight: 1 }} />
                            {tVendorDash("contractsToBeReattached", {
                                nbCatalogsMoved: claimedVendors
                                    .filter(v => v.id !== selectedVendor.id)
                                    .reduce((total: number, vendor: any) => total + vendor.catalogs?.length, 0),
                                nbSubsMoved: claimedVendors
                                    .filter(v => v.id !== selectedVendor.id)
                                    .reduce((total: number, vendor: any) => 
                                        total + (vendor.catalogs?.reduce((catalogTotal: number, catalog: any) => 
                                            catalogTotal + (catalog.subscriptionsCount || 0), 0) || 0), 0
                                ),
                                vendor: selectedVendor.name
                            })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {tVendorDash("contractsToBeReattachedGroups")}
                            &nbsp;
                            {[...claimedVendors
                                .filter(v => v.id !== selectedVendor.id)
                                .reduce(
                                    (groups, vendor) => vendor.catalogs?.reduce((groups, c) => groups.add(c.group.name), groups),
                                    new Set<string>())
                            ].map((groupName, i) => <span key={`group-${i}`}>
                                    <i className="icon icon-users" style={{ marginRight: "5px" }} />
                                    {groupName}
                                </span>)
                            }
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ padding: 2 }}>
                <Button 
                    onClick={handleCancelConsolidation}
                    variant="outlined"
                    color="inherit"
                >
                    {tVendorDash("cancel")}
                </Button>
                <Button 
                    onClick={handleConfirmConsolidation}
                    variant="contained"
                    color="primary"
                    disabled={consolidatingVendorId !== null}
                >
                    {consolidatingVendorId !== null ? (
                        <>
                            <CircularProgress size={16} sx={{ marginRight: 1 }} />
                            {tVendorDash("consolidating")}
                        </>
                    ) : (
                        tVendorDash("confirmConsolidation")
                    )}
                </Button>
            </DialogActions>
        </Dialog>
                </div>
            </div>

            {claims}
        </>
    }

    return <>
        <div className="col-md-12">
            {claimedVendors?.map(v => <div className="col-md-12" key={v.id}>
                {v.name}
            </div>)}
        </div>

        {claims}
    </>
}

export default VendorDashboard;