import { useHasVendorsByUserIdQuery, useUserAccountQuery } from "@gql";
import { VendorClaims } from "./VendorClaims";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { Box } from "@mui/material";

const VendorHomeWidget = () => {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const {
        data: userData,
        loading: userLoading,
        error: userError,
    } = useUserAccountQuery();

    // Check if user has claimed vendors (using minimal query)
    const {
        data: { hasVendorsByUserId: claimedVendors } = {},
        loading: claimedVendorsLoading,
        error: claimedVendorsError,
        refetch: refetchClaimedVendors,
    } = useHasVendorsByUserIdQuery({
        variables: { userId: userData?.me?.id || -1 },
        skip: !userData?.me?.id,
    });

    if (userLoading || claimedVendorsLoading) {
        return <CircularProgressBox />;
    }

    if (userError || claimedVendorsError) {
        return <></>;
    }

    return (
        <>
            <VendorClaims onClaim={() => refetchClaimedVendors()} sx={{ mb: 2 }} />
            {claimedVendors && <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                '& .btn': {
                    maxWidth: '100%',
                    whiteSpace: 'unset',
                },
            }}>
                <a className="btn btn-lg btn-primary" href="/vendor/dashboard">
                    <i className="icon icon-farmer" />&nbsp;{tVendorDash("goToVendorDashboard")}
                </a>
            </Box>}
        </>
    );
};
export default VendorHomeWidget;