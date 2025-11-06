import { DistributionList } from "@components/DistributionInfoCard";
import { InitVendorPageQuery } from "@gql";
import { Box, Typography } from "@mui/material";

function VendorDistributions({ nextDistributions }: {nextDistributions?: InitVendorPageQuery["initVendorPage"]["nextDistributions"]}) {

    return <>
        {nextDistributions?.map(({ group, distributions }) => (<Box key={group.id}>
            <Typography>{group.name}</Typography>
            <DistributionList distributions={distributions} />
        </Box>))}
    </>
}

export default VendorDistributions;