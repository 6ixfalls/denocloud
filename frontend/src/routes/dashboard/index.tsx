import { Outlet } from "react-router-dom";
import { Typography, Tabs } from "@supabase/ui";

const { Text } = Typography;

export default function Dashboard() {
    return (
        <div>
            <Text>DenoCloud Dashboard</Text>
            <Tabs defaultActiveId="panel-1" type="underlined">
            <Tabs.Panel id="panel-1" label="Projects">
                
            </Tabs.Panel>
            </Tabs>
        </div>
    );
}