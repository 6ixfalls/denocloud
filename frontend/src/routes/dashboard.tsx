import { Outlet, useNavigate } from "react-router-dom";
import { Typography } from "@supabase/ui";
import { useEffect } from "react";
import { supabaseClient } from '../index';

export default function Dashboard() {
  let navigate = useNavigate();

  useEffect(() => {
    const user = supabaseClient.auth.user();

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