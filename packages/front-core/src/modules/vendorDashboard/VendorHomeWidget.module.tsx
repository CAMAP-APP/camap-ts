import { useUserAccountQuery } from "@gql";
import { CircularProgress } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";

const VendorHomeWidget = () => {
    const { t } = useCamapTranslation({
    });

    const {
        data: userData,
        loading: userLoading,
        error: userError,
      } = useUserAccountQuery();

    if(userLoading) return <CircularProgress />
    if(userError) return <></>

    const v = { name: 'dummy', companyNumber: null };

    return <>
        <div>
            <a href="">{t("Go to your vendor dashboard")}</a>
        </div>
        <div className="article">
            <h4>{t("Your email is associated with the following vendors, is that you?")}</h4>
            <table className="table">
                <thead>
                    <tr>
                        <th />
                        <th>{t("Name")}</th>
                        <th>{t("VAT number")}</th>
                        <th>{t("Groups")}</th>
                        <th>{t("Contracts")}</th>
                        <th />
                        <th />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ height: "100%", padding:0, width: "50px", overflow:"hidden"}}>
                            <img src="::v.getImage()::" width="50px" alt={v.name} />
                        </td>
                        <td>{v.name}</td>
                        <td>{v.companyNumber ?? t("Unknown")}</td>
                        <td>{}</td>
                        <td>{}</td>
                        <td style={{ display: "flex", flexFlow: "row", gap: "0.2em"}}>
                            <button className="btn btn-sm btn-danger" >{t("Claim")}</button>
                            <a className="btn btn-sm btn-primary" href={`mailto:+v.getGroupContactMailto()::`}>
                                <span className="glyphicon glyphicon-envelope" />&nbsp;{t("Contact groups")}
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}
export default VendorHomeWidget;