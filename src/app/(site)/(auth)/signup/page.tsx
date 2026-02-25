import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký | Planeat",
};

const SignupPage = () => {
  return <SignUp />;
};

export default SignupPage;