import { Outlet } from "react-router-dom";
import { Typography, Tabs } from "@supabase/ui";

export default function Dashboard() {
    return (
        <div className="p-5 font-medium text-white">
          <Typography.Text>asd</Typography.Text>
          <Outlet />
        </div>
      );
}