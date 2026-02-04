"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI, setAuthToken } from "@/utils/api";

interface SignUpProps {
  onClose?: () => void; // Function to close modal if component is used in a modal
}

const SignUp: React.FC<SignUpProps> = ({ onClose }) => {
  const router = useRouter();

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  
  // State to control which form to show
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
      const response = await authAPI.register({
        email: signupData.email,
        password: signupData.password,
      });
      
      toast.success("Tài khoản đã được tạo! Vui lòng kiểm tra email để lấy mã xác thực.");
      // Show OTP form instead of redirecting
      setShowOTP(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Vui lòng nhập mã 6 chữ số hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyEmail({ email: signupData.email, code });
      toast.success(response.data.message || "Email đã được xác thực! Hoàn thiện hồ sơ của bạn");
      
      // FIXED: Close modal first if callback exists
      if (onClose) {
        onClose();
      }
      
      // Then redirect to settings
      router.push("/settings");
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

  // Render OTP form if showOTP is true
  if (showOTP) {
    return (
      <>
        <div className="mb-10 text-center mx-auto inline-block">
          <Logo />
        </div>

        <h3 className="mb-3 text-2xl font-bold text-dark dark:text-white text-center">
          Xác thực Email
        </h3>
        <p className="mb-8 text-base text-body-color dark:text-white/70 text-center">
          Chúng tôi đã gửi mã xác thực đến <strong>{signupData.email}</strong>
        </p>

        <form onSubmit={handleVerifyOTP}>
          <div className="mb-[22px]">
            <input
              type="text"
              placeholder="Nhập mã 6 chữ số"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                handleCodeChange(e.clipboardData.getData('text'));
              }}
              maxLength={6}
              required
              className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-center text-2xl tracking-widest text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary"
            />
          </div>

          {attemptsLeft < 5 && (
            <p className="mb-4 text-sm text-red-500 text-center">
              Còn {attemptsLeft} lần thử
            </p>
          )}

          <div className="mb-6">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="bg-primary w-full py-3 rounded-lg text-18 font-medium border border-primary hover:text-primary hover:bg-transparent disabled:opacity-50"
            >
              Xác thực Email {loading && <Loader />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOTP(false)}
            className="text-primary hover:underline text-sm"
          >
            ← Quay lại đăng ký
          </button>
        </form>
      </>
    );
  }

  // Original signup form
  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      <form onSubmit={registerUser}>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Email"
            value={signupData.email}
            onChange={(e) =>
              setSignupData({ ...signupData, email: e.target.value })
            }
            required
            className="w-full rounded-md border border-dark_border border-opacity-60 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={signupData.password}
            onChange={(e) =>
              setSignupData({ ...signupData, password: e.target.value })
            }
            required
            minLength={6}
            className="w-full rounded-md border border-dark_border border-opacity-60 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={signupData.confirmPassword}
            onChange={(e) =>
              setSignupData({ ...signupData, confirmPassword: e.target.value })
            }
            required
            minLength={6}
            className="w-full rounded-md border border-dark_border border-opacity-60 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary w-full py-3 rounded-lg text-18 font-medium border border-primary hover:text-primary hover:bg-transparent disabled:opacity-50"
          >
            Đăng ký {loading && <Loader />}
          </button>
        </div>
      </form>

      <p className="text-body-secondary text-white text-base">
        Đã có tài khoản?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </>
  );
};

export default SignUp;