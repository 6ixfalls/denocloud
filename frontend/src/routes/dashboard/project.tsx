import { Typography } from "@supabase/ui";
import { Outlet, useParams } from "react-router-dom";

const { Text } = Typography;

function ProjectTitle() {
    const { project } = useParams();
    return (
        <div>
            <Text>{project}</Text>
        </div>
    );
}

export default function Project() {
    return (
        <div>
            <ProjectTitle />
            <Outlet />
        </div>
    );
}