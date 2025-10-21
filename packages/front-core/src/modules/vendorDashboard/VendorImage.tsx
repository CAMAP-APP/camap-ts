import { CSSProperties } from "react"

export const VendorImage = ({
    vendor,
    width = "80px",
    height = "80px"
}:{
    vendor: { name: string, image?: string|null },
    width?: CSSProperties['width'],
    height?: CSSProperties['height']
}) => {
    if(vendor.image)
        return <img 
                src={vendor.image} 
                className="img-responsive" 
                style={{ width, height, objectFit: "cover", borderRadius: "4px", margin: "0 auto", }}
                alt={vendor.name} 
            />

    return <div 
            style={{ 
                width,
                height,
                backgroundColor: "#f0f0f0", 
                borderRadius: "4px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: height
            }}
        >
            <i className="icon icon-farmer" style={{ fontSize: "33%", color: "#999" }} />
        </div>
}