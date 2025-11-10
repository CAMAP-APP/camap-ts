import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import { useInitVendorPageQuery } from "@gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import VendorLayout, { PlaceLike, VendorMapContext } from "layout/VendorLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { reactRouterDefaultProps } from "react-router-config";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import VendorDescription from "./VendorDescription";
import VendorDistributions from "./VendorDistributions";
import VendorDocuments from "./VendorDocuments";
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

  const [selectedDistributionPlace, setSelectedDistributionPlace] = useState<PlaceLike|undefined>(undefined);
  const [distributionPlaces, setDistributionPlace] = useState([] as PlaceLike[]);
  const addDistributionPlace = useCallback((p:PlaceLike) => {
    setDistributionPlace(places => {
      const set = new Set(places);
      set.add(p);
      return Array.from(set);
    });
  }, [])
  const setSelectedPlaceId = useCallback((placeId:number) => {
    setSelectedDistributionPlace(distributionPlaces.find(p => p.id === placeId));
  }, [setSelectedDistributionPlace, distributionPlaces]);
  const vendorMap = useMemo(() => {
    return {
      distributionPlaces,
      selectedDistributionPlace,
      setSelectedDistributionPlace: setSelectedPlaceId,
      addDistributionPlace
    };
  }, [
    distributionPlaces,
    selectedDistributionPlace,
    setSelectedPlaceId,
    addDistributionPlace
  ]);

  const {
      data: { initVendorPage : { nextDistributions } = {} } = {},
  } = useInitVendorPageQuery({
      variables: { vendorId: vendor.id }
  });

  useEffect(() => {
      nextDistributions?.forEach(d => d.distributions.length > 0 && addDistributionPlace(d.distributions[0].place))
  }, [nextDistributions, addDistributionPlace]);

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
        content: <VendorDistributions nextDistributions={nextDistributions} />
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
        <VendorMapContext.Provider value={vendorMap}>
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
        </VendorMapContext.Provider>
    </BrowserRouter>
}

export default VendorProfileRouter;