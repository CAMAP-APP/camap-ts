import { Box, Typography } from "@mui/material";

function VendorDescription({vendor}: {vendor: { longDesc?: string }}) {
    return <Box>
      <Typography variant="body1" paragraph>{vendor.longDesc}</Typography>
    </Box>
}

export default VendorDescription;