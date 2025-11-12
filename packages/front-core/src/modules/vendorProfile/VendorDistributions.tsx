import { DistributionList } from "@components/DistributionInfoCard";
import { InitVendorPageQuery } from "@gql";
import { Box, Typography } from "@mui/material";
import { VendorMapContext } from "layout/VendorLayout";
import { useContext } from "react";

function VendorDistributions({ nextDistributions }: {nextDistributions?: InitVendorPageQuery["vendor"]["nextDistributions"]}) {

    const { setSelectedDistributionPlace } = useContext(VendorMapContext);

    return <>
        {nextDistributions?.map(({ group, distributions }) => (<Box key={group.id}>
            <Typography>{group.name}</Typography>
            <DistributionList distributions={distributions} onPlaceClick={setSelectedDistributionPlace} />
        </Box>))}
    </>
}

export default VendorDistributions;