import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert
} from "@mui/material";
import { useConsolidateVendorsMutation, Vendor } from "@gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";
import VendorsMergeMessage from "./VendorsMergeMessage";

interface VendorConsolidationProps {
    open: boolean;
    onClose: () => void;
    selectedVendor: Pick<Vendor, "id" | "name" | "image" | "companyNumber">;
    vendorsToConsolidate: Pick<Vendor, "id" | "name" | "image" | "companyNumber">[];
    onConsolidationComplete: () => void;
}

const VendorConsolidation = ({
    open,
    onClose,
    selectedVendor,
    vendorsToConsolidate,
    onConsolidationComplete
}: VendorConsolidationProps) => {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });
    const [isConsolidating, setIsConsolidating] = useState(false);
    
    // Consolidate vendors mutation
    const [consolidateVendorsMutation] = useConsolidateVendorsMutation();

    const handleConfirmConsolidation = async () => {
        if (!selectedVendor?.id) return;
        
        try {
            setIsConsolidating(true);
            await consolidateVendorsMutation({
                variables: { vendorId: selectedVendor.id },
            });
            
            // Call the completion callback to refresh data
            onConsolidationComplete();
            
        } catch (error) {
            console.error('Error consolidating vendors:', error);
        } finally {
            setIsConsolidating(false);
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
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
                <VendorsMergeMessage mergeTarget={selectedVendor} mergedVendors={vendorsToConsolidate} />
            </DialogContent>
            
            <DialogActions sx={{ padding: 2 }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                >
                    {tVendorDash("cancel")}
                </Button>
                <Button 
                    onClick={handleConfirmConsolidation}
                    variant="contained"
                    color="primary"
                    disabled={isConsolidating}
                >
                    {isConsolidating ? (
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
    );
};

export default VendorConsolidation;
