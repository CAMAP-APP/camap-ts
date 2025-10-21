import { useHasVendorsByUserIdQuery, useUserAccountQuery } from "@gql";
import { CircularProgress } from "@mui/material";
import { VendorClaims } from "./VendorClaims";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";

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
        return <CircularProgress />;
    }

    if (userError || claimedVendorsError) {
        return <></>;
    }

    return (
        <>
            <VendorClaims onClaim={() => refetchClaimedVendors()}/>
            {claimedVendors && <div className="col-md-12 text-center" style={{ marginBottom: "1em"}}>
                <a className="btn btn-lg btn-primary" href="/vendor">
                    <i className="icon icon-farmer" />&nbsp;{tVendorDash("goToVendorDashboard")}
                </a>
            </div>}
        </>
    );
};
export default VendorHomeWidget;