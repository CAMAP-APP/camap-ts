import { useClaimVendorMutation, useGetClaimableVendorsQuery, useUserAccountQuery } from "@gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";

export const VendorClaims = (
    props: {
        onClaim: (vendorId: number) => void
    }
) => {
    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

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

    // Claim vendor mutation
    const [claimVendorMutation] = useClaimVendorMutation();

    const handleClaimVendor = async (vendorId: number) => {
        try {
            setClaimingVendorId(vendorId);
            await claimVendorMutation({
                variables: { vendorId },
            });
            
            refetchClaimableVendors();
            props.onClaim(vendorId);
            
        } catch (error) {
            console.error('Error claiming vendor:', error);
        } finally {
            setClaimingVendorId(null);
        }
    };

    if (
        userLoading || claimableVendorsLoading ||
        userError || claimableVendorsError ||
        claimableVendors && claimableVendors.length === 0
    ) {
        return <></>;
    }

    return <div className="col-md-12">
        <h4>{tVendorDash("yourEmailAssociatedVendors")}</h4>
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
                        <td style={{ display: "flex", flexFlow: "row", gap: "0.2em", justifyContent: "flex-end" }}>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleClaimVendor(vendor.id)}
                                disabled={claimingVendorId === vendor.id}
                            >
                                {claimingVendorId === vendor.id ? tVendorDash("claiming") : tVendorDash("claim")}
                            </button>
                            <a 
                                className="btn btn-sm btn-primary" 
                                href={`mailto:${vendor.email}`}
                            >
                                <span className="glyphicon glyphicon-envelope" />&nbsp;{tVendorDash("contactGroups")}
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>;
}