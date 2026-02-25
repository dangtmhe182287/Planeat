"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI, setAuthToken } from "@/utils/api";
import { Icon } from "@iconify/react";

const Signin = () => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(loginData);
      if (response.data.token) {
        setAuthToken(response.data.token);
        toast.success("Đăng nhập thành công");
        router.push("/dashboard");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Đăng nhập để tiếp tục lập kế hoạch bữa ăn
          </p>

          <form onSubmit={loginUser} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Icon
                icon="tabler:mail"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
              />
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Icon
                icon="tabler:lock"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <Icon icon={showPassword ? "tabler:eye-off" : "tabler:eye"} width="20" height="20" />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader /> : null}
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-gray-400 text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center gap-1 transition">
            <Icon icon="tabler:arrow-left" width="16" height="16" />
            Về trang chủ
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Signin;