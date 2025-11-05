import { CircularProgress, IconButton, List, ListItem, ListItemButton } from "@mui/material";
import CamapIcon, { CamapIconId } from "./utils/CamapIcon";
import { EntityFile, useDeleteDocumentMutation } from "@gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";

type EntityFileLike = Pick<EntityFile, "id" | "visibility" | "url" | "name">;
const DocLine = ({doc, editable = false, onDelete}:{ doc: EntityFileLike, editable?:boolean, onDelete?: () => void }) => {
    
    const { t } = useCamapTranslation({});

    const [ deleteDocument ] = useDeleteDocumentMutation({
        variables: {
            id: doc.id
        }
    });

    const [deleting, setDeleting] = useState(false);

    const onClick = () => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = `${doc.name ?? "No name"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return <ListItem
        sx={{ pl: 0 }}
        secondaryAction={
            editable && <IconButton edge="end"
                size="small"
                aria-label="delete"
                onClick={async () => {
                    setDeleting(true);
                    await deleteDocument();
                    onDelete?.();
                }}
                disabled={deleting}
            >
                {deleting && <CircularProgress />}
                {!deleting && <CamapIcon id={CamapIconId.delete} />}
            </IconButton>
        }
    >
        <ListItemButton
            component="a"
            sx={{ wordBreak: 'break-all', pl: 1 }}
            onClick={onClick}
        >
            <i className="icon icon-file-pdf" style={{ marginRight: '0.2em' }}/>
            {doc.name ?? t("noDocumentName")}
        </ListItemButton>
    </ListItem>
}

function DocumentList({ documents, ...props }:{ documents: EntityFileLike[], editable?:boolean, onDelete?:() => void }) {

    if(documents.length === 0) return <></>

    return <List dense>
        {documents.map((doc) => (
            <DocLine key={doc.id} doc={doc} {...props} />
        ))}
    </List>

}

export default DocumentList;