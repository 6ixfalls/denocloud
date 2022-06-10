import { useNavigate, Link } from "react-router-dom";
import { Button, Typography } from "@supabase/ui";
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
        <div className="w-full h-screen relative flex flex-col items-center justify-center mx-auto text-gray-50 select-none font-medium">
            <div className="absolute select-none filter transition opacity-[5%] duration-200 blur-sm">
                <h1 className="text-[28rem]">404</h1>
            </div>
            <div className="transition flex flex-col space-y-6 items-center justify-center opacity-100">
                <div className="w-[380px] flex flex-col items-center justify-center space-y-3 text-center">
                    <h3 className="text-xl">Looking for something? 🔍</h3>
                    <p className="text-scale-1100 font-normal">The page you requested does not exist.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard"><Button type="primary" size="small">Home</Button></Link>
                </div>
            </div>
        </div>
    );
}