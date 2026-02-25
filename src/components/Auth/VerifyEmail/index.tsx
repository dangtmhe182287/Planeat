"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI } from "@/utils/api";
import { Icon } from "@iconify/react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Vui lòng nhập mã 6 chữ số hợp lệ"); return; }
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, code });
      toast.success("Email đã được xác thực! Vui lòng đăng nhập.");
      window.location.href = "/signin";
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || "Xác thực thất bại";
      toast.error(message);
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
    }
  };

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
            <span className="text-white font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

          <p className="text-center mt-6">
            <Link href="/signin" className="text-gray-400 hover:text-gray-200 text-sm flex items-center justify-center gap-1 transition">
              <Icon icon="tabler:arrow-left" width="16" height="16" />
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

const VerifyEmail = () => (
  <Suspense fallback={<Loader />}>
    <VerifyEmailForm />
  </Suspense>
);

export default VerifyEmail;