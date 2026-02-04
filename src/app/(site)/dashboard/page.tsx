import Dashboard from "@/components/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Planeat",
};

const DashboardPage = () => {
  return <Dashboard />;
};

export default DashboardPage;