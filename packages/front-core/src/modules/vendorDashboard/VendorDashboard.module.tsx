import { VendorClaims } from "./VendorClaims";
import VendorConsolidation from "./VendorConsolidation";
import VendorForm from "./VendorForm";
import { CircularProgress } from "@mui/material";
import { GetVendorsByUserIdQuery, useGetVendorsByUserIdQuery, useUserAccountQuery } from "@gql";
import { useState } from "react";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { VendorImage } from "./VendorImage";
import { HashRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "layout/DashboardLayout";
import {
    Person as PersonIcon,
  } from '@mui/icons-material';
import { reactRouterDefaultProps } from "react-router-config";

const MultipleVendorDashContent = ({
    claimedVendors,
    refetchClaimedVendors
}: {
    claimedVendors: GetVendorsByUserIdQuery["getVendorsByUserId"]
    refetchClaimedVendors: () => void
}) => {

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    const handleVendorSelection = (vendorId: number) => {
        const vendor = claimedVendors?.find(v => v.id === vendorId);
        setSelectedVendor(vendor);
    };

    const handleCancelConsolidation = () => {
        setSelectedVendor(null);
    };

    const handleConsolidationComplete = () => {
        // Refetch the vendors list to show the updated state
        refetchClaimedVendors();
        setSelectedVendor(null);
    };

    return <>
        <h4>{tVendorDash("multipleVendorProfiles")}</h4>
        <p>{tVendorDash("chooseUniqueProfile")}</p>
        <div className="row" style={{ justifyContent: "center", display: "flex" }}>
            {claimedVendors?.map(vendor => <div className="col-md-4"
                key={`vendor-${vendor.id}`}>
                <div className="panel panel-default" style={{ marginBottom: "15px" }}>
                    <div className="panel-body text-center">
                        <div style={{ marginBottom: "10px" }}>
                            <VendorImage vendor={vendor} />
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
        </div>

        <VendorConsolidation
                    open={selectedVendor != null}
                    onClose={handleCancelConsolidation}
                    selectedVendor={selectedVendor}
                    vendorsToConsolidate={claimedVendors}
                    onConsolidationComplete={handleConsolidationComplete}
                />
    </>
}

const VendorDashContent = ({
    vendor,
    refetchClaimedVendors
}: {
    vendor: GetVendorsByUserIdQuery["getVendorsByUserId"][number]
    refetchClaimedVendors: () => void
}) => {

    return <>
        <h1>Bienvenue {vendor.name}</h1>
        <div className="row">
            <VendorClaims onClaim={() => {refetchClaimedVendors()}} />
        </div>
    </>
}

const VendorDashboardRouter = () => {

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });const {
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

    if (userLoading || claimedVendorsLoading) {
        return <CircularProgress />;
    }

    if (userError || claimedVendorsError || !claimedVendors) {
        return <></>;
    }

    if(claimedVendors?.length !== 1)
        return <div className="col-md-12">
            <div className="row">
                <div className="col-md-12">
                    {claimedVendors?.length < 1 && <h4>{tVendorDash("noVendorProfiles")}</h4>}
                    {claimedVendors?.length > 1 && <MultipleVendorDashContent
                            claimedVendors={claimedVendors}
                            refetchClaimedVendors={refetchClaimedVendors} />}
                </div>
            </div>
            <div className="row">
                <VendorClaims onClaim={() => {refetchClaimedVendors()}} />
            </div>
        </div>

    const vendor = claimedVendors[0];

    const nav = [
        {label: tVendorDash('vendorDashboardProfile'), icon: <PersonIcon />, path: 'edit'}
    ]

    return <HashRouter {...reactRouterDefaultProps}>
        <Routes>
            <Route element={
                <DashboardLayout
                    navigation={nav}
                    home={{
                        label: tVendorDash('vendorDashboardHome'),
                        icon: <PersonIcon />,
                        path: '/'
                    }}
                />
            }>
                <Route path="/" element={<VendorDashContent vendor={vendor} refetchClaimedVendors={refetchClaimedVendors} />} />
                <Route path="edit" element={<VendorForm vendorId={vendor.id} onSuccess={refetchClaimedVendors} />} />
            </Route>
        </Routes>
    </HashRouter>
}

export default VendorDashboardRouter;