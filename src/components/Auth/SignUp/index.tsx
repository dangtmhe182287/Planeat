// src/components/Auth/SignUp/index.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI, setAuthToken } from "@/utils/api";
import { Icon } from "@iconify/react";

interface SignUpProps {
  onClose?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onClose }) => {
  const router = useRouter();

  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [code, setCode] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const registerUser = async (e: any) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({ email: signupData.email, password: signupData.password });
      toast.success("Tài khoản đã được tạo! Vui lòng kiểm tra email để lấy mã xác thực.");
      setShowOTP(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Vui lòng nhập mã 6 chữ số hợp lệ"); return; }
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email: signupData.email, code });
      const loginResponse = await authAPI.login({ email: signupData.email, password: signupData.password });
      setAuthToken(loginResponse.data.token);
      toast.success("Email đã được xác thực!");
      if (onClose) onClose();
      router.push("/onboarding");
    } catch (error: any) {
      const message = error.response?.data?.message || "Xác thực thất bại";
      toast.error(message);
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-8">
              <Logo />
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon icon="tabler:mail-check" className="text-primary" width="32" height="32" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">Xác thực Email</h1>
            <p className="text-gray-400 text-center text-sm mb-8">
              Chúng tôi đã gửi mã xác thực đến{" "}
              <span className="text-white font-medium">{signupData.email}</span>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                placeholder="· · · · · ·"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onPaste={(e) => { e.preventDefault(); handleCodeChange(e.clipboardData.getData("text")); }}
                maxLength={6}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition"
              />

              {attemptsLeft < 5 && (
                <p className="text-sm text-red-400 text-center">Còn {attemptsLeft} lần thử</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader /> : null}
                Xác thực Email
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowOTP(false)}
              className="mt-6 w-full text-center text-gray-400 hover:text-gray-200 text-sm flex items-center justify-center gap-1 transition"
            >
              <Icon icon="tabler:arrow-left" width="16" height="16" />
              Quay lại đăng ký
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Tạo tài khoản</h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Bắt đầu lập kế hoạch bữa ăn cá nhân của bạn
          </p>

          <form onSubmit={registerUser} className="space-y-4">
            <div className="relative">
              <Icon icon="tabler:mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>

            <div className="relative">
              <Icon icon="tabler:lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                <Icon icon={showPassword ? "tabler:eye-off" : "tabler:eye"} width="20" height="20" />
              </button>
            </div>

            <div className="relative">
              <Icon icon="tabler:lock-check" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                <Icon icon={showConfirm ? "tabler:eye-off" : "tabler:eye"} width="20" height="20" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader /> : null}
              Đăng ký
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <p className="text-center text-gray-400 text-sm">
            Đã có tài khoản?{" "}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>

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

export default SignUp;