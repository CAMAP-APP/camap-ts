import { DistributionList } from "@components/DistributionInfoCard";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { useInitVendorPageQuery, Vendor } from "@gql";
import { Alert, Box, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";

function VendorDistributions({ vendor: { id: vendorId } }: {vendor: Pick<Vendor, "id">}) {

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const {
        data: { initVendorPage : { nextDistributions } = {} } = {},
        loading,
        error
    } = useInitVendorPageQuery({
        variables: { vendorId: vendorId }
    });

    if(error)
        return <Alert severity="error">{error.message}</Alert>

    if(loading)
        return <CircularProgressBox />

    return <>
        {nextDistributions?.map(({ group, distributions }) => (<Box key={group.id}>
            <Typography>{group.name}</Typography>
            <DistributionList distributions={distributions} />
        </Box>))}
    </>
}

export default VendorDistributions;