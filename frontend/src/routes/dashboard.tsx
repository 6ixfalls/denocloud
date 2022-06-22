import { Outlet, useNavigate } from "react-router-dom";
import { Typography } from "@supabase/ui";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect } from "react";
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { supabaseClient } from '../index';

const { Item } = Breadcrumb;

export default function Dashboard() {
  let navigate = useNavigate();

  useEffect(() => {
    const user = supabaseClient.auth.user();

    if (!user)
      navigate("/", { replace: true });
  });

  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="p-5 font-medium text-white">
      <Typography.Text>DenoCloud</Typography.Text>
      <Breadcrumb>
        {breadcrumbs.map(({ match, location, key, breadcrumb }, index, { length }) => <Item active={length - 1 === index} key={key} onClick={() => {
          navigate(match);
        }}>{breadcrumb}</Item>)}
      </Breadcrumb>
      <Outlet />
    </div>
  );
}