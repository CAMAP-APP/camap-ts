import { Box } from "@mui/material";
import DOMPurify from 'dompurify';

function VendorDescription({vendor}: {vendor: { longDesc?: string }}) {
    return <Box>
      <span dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(vendor.longDesc ?? '')
      }} />
    </Box>
}

export default VendorDescription;