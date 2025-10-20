import { useGetClaimableVendorsQuery, useUserAccountQuery } from "@gql";
import { CircularProgress } from "@mui/material";
import { useGetVendorsByUserIdQuery, useClaimVendorMutation } from "@gql";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const VendorHomeWidget = () => {
    const { t } = useTranslation("vendorDashboard");
    const [claimingVendorId, setClaimingVendorId] = useState<number | null>(null);

    const {
        data: userData,
        loading: userLoading,
        error: userError,
    } = useUserAccountQuery();

    // Claimable Vendors
    const {
        data: { getClaimableVendors: claimableVendors } = {},
        loading: claimableVendorsLoading,
        error: claimableVendorsError,
        refetch: refetchClaimableVendors
    } = useGetClaimableVendorsQuery({
        skip: !userData?.me?.email,
    });

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

    // Claim vendor mutation
    const [claimVendorMutation] = useClaimVendorMutation();

    const handleClaimVendor = async (vendorId: number) => {
        try {
            setClaimingVendorId(vendorId);
            await claimVendorMutation({
                variables: { vendorId },
            });
            // Refresh the data to show the claimed vendor
            await Promise.all([
                refetchClaimedVendors(),
                refetchClaimableVendors()
            ]);
            // You might want to show a success message here
        } catch (error) {
            console.error('Error claiming vendor:', error);
            // You might want to show an error message here
        } finally {
            setClaimingVendorId(null);
        }
    };

    if (userLoading || claimableVendorsLoading || claimedVendorsLoading) {
        return <CircularProgress />;
    }

    if (userError || claimableVendorsError || claimedVendorsError) {
        return <></>;
    }

    return (
        <>
            {claimedVendors && claimedVendors.length > 0 && <div className="col-md-12 text-center">
                <a className="btn btn-lg btn-primary" href="/vendor-dashboard">
                    <i className="icon icon-farmer" />&nbsp;{t("Go to your vendor dashboard")}
                </a>
            </div>}
            { claimableVendors && claimableVendors.length > 0 && <div className="article">
                <h4>{t("Your email is associated with the following vendors, is that you?")}</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th />
                            <th>{t("Name")}</th>
                            <th>{t("VAT number")}</th>
                            <th>{t("Groups")}</th>
                            <th>{t("Contracts")}</th>
                            <th />
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {claimableVendors?.map((vendor) => (
                            <tr key={vendor.id}>
                                <td style={{ height: "100%", padding: 0, width: "50px", overflow: "hidden" }}>
                                    {vendor.image ? (
                                        <img 
                                            src={vendor.image} 
                                            width="50px" 
                                            alt={vendor.name} 
                                        />
                                    ) : (
                                        <div style={{ width: "50px", height: "50px", backgroundColor: "#f0f0f0" }} />
                                    )}
                                </td>
                                <td>{vendor.name}</td>
                                <td>{vendor.companyNumber ?? t("Unknown")}</td>
                                <td>
                                    {[...new Set(vendor.catalogs?.map(catalog => catalog.group.name))]
                                        .filter(Boolean)
                                        .join(", ") || t("None")}
                                </td>
                                <td>
                                    {   vendor.catalogs
                                        ? <ul>
                                            {vendor.catalogs?.map(
                                                catalog => <li key={catalog.id}>
                                                    {t('vendorCatalogListItem', {
                                                        catalogName: catalog.name,
                                                        subscriptionCount: catalog.subscriptionsCount || 0
                                                    })}
                                                </li>
                                            )}
                                          </ul>
                                        : t("None")
                                    }
                                </td>
                                <td style={{ display: "flex", flexFlow: "row", gap: "0.2em" }}>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleClaimVendor(vendor.id)}
                                        disabled={claimingVendorId === vendor.id}
                                    >
                                        {claimingVendorId === vendor.id ? t("Claiming...") : t("Claim")}
                                    </button>
                                    <a 
                                        className="btn btn-sm btn-primary" 
                                        href={`mailto:${vendor.email}`}
                                    >
                                        <span className="glyphicon glyphicon-envelope" />&nbsp;{t("Contact groups")}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>}
        </>
    );
};
export default VendorHomeWidget;