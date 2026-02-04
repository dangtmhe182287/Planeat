import Settings from "@/components/Settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Planeat",
};

const SettingsPage = () => {
  return <Settings />;
};

export default SettingsPage;