import Signin from "@/components/Auth/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Planeat",
};

const SigninPage = () => {
  return <Signin />;
};

export default SigninPage;