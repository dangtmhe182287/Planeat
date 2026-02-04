"use client";
import { useRouter } from "next/navigation";
import { removeAuthToken } from "@/utils/api";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

const Logout = () => {
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-base font-medium text-dark hover:text-primary dark:text-white dark:hover:text-primary"
    >
      <Icon icon="tabler:logout" width="20" height="20" />
      Logout
    </button>
  );
};

export default Logout;