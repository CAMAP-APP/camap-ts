import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { reactRouterDefaultProps } from "react-router-config";
import VendorLayout from "layout/VendorLayout";
import VendorDocuments from "./VendorDocuments";
import VendorDescription from "./VendorDescription";
import VendorDistributions from "./VendorDistributions";
import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import VendorProducts from "./VendorProducts";

type VendorLike = {
    id: number,
    name: string,
    profession?: string,
    email?: string,
    phone?: string,
    peopleName?: string,
    image?: string,
    images: {
      logo?: string,
      portrait?: string,
      banner?: string,
      farm1?: string,
      farm2?: string,
      farm3?: string,
      farm4?: string,
    },
    address1?: string,
    address2?: string,
    zipCode: string,
    city: string,
    linkText?: string,
    linkUrl?: string,
    desc?: string,
    longDesc?: string,
};

const VendorProfileRouter = ({ vendor, basePath }: { vendor: VendorLike, basePath: string }) => {

  const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

  const tabs = [
    {
        id: 'description',
        label: tVendorDash('publicTabDescription'),
        icon: <CamapIcon id={CamapIconId.info} />,
        path: "/description",
        content: <VendorDescription vendor={vendor} />
    },
    {
        id: 'deliveries',
        label: tVendorDash('publicTabDeliveries'),
        icon: <CamapIcon id={CamapIconId.delivery} />,
        path: "/deliveries",
        content: <VendorDistributions vendor={vendor} />
    },
    {
        id: 'documents',
        label: tVendorDash('publicTabDocuments'),
        icon: <CamapIcon id={CamapIconId.file} />,
        path: "/documents",
        content: <VendorDocuments vendorId={vendor.id} />
    },
    {
        id: 'products',
        label: tVendorDash('publicTabProducts'),
        icon: <CamapIcon id={CamapIconId.products} />,
        path: "/products",
        content: <VendorProducts vendorId={vendor.id} />
    },
]

    return <BrowserRouter {...reactRouterDefaultProps} basename={basePath}>
        <Routes>
            <Route element={
                <VendorLayout
                    vendor={vendor}
                    tabs={tabs}
                />
            }>
                {tabs.map(t => <Route key={t.path} path={t.path} element={t.content} />)}
                <Route index element={<Navigate to="/description" replace />} />
            </Route>
        </Routes>
    </BrowserRouter>
}

export default VendorProfileRouter;