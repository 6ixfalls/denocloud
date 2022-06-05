import { Outlet, useNavigate } from "react-router-dom";
import { Typography, Tabs } from "@supabase/ui";
import { useEffect } from "react";

export default function Dashboard() {
  let navigate = useNavigate();

  useEffect(() => {
    const user = globalThis.supabaseClient.auth.user();

    if (!user)
      navigate("/", { replace: true });
  });

  return (
    <div className="p-5 font-medium text-white">
      <Typography.Text>DenoCloud</Typography.Text>
      <Outlet />
    </div>
  );
}