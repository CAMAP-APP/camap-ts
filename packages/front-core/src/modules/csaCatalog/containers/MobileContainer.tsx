import Block from "@components/utils/Block/Block";
import MediumActionIcon from "./MediumActionIcon";
import { CamapIconId } from "@components/utils/CamapIcon";

export const MobileContainer = ({
    children,
    icon,
    title,
    actions
}: {
    children: React.ReactNode,
    icon: CamapIconId,
    title: string
    actions: React.ReactNode
}) => {
    return <Block
        title={title}
        icon={<MediumActionIcon id={icon} sx={{ color: theme => theme.palette.primary.contrastText }} />}
        variant="primary"
        sx={{
            height: '100%',
            overflow: 'clip'
        }}
        contentSx={{
            p: {
                xs: 0,
                sm: 2,
            },
        }}
        headerAction={actions}
    >
        {children}
    </Block>
};