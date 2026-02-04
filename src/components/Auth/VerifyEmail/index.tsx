"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI } from "@/utils/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyEmail({ email, code });
      toast.success("Email verified! Please sign in.");
      
      // Hard redirect to signin
      window.location.href = "/signin";
      
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || "Verification failed";
      toast.error(message);
      
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      <h3 className="mb-3 text-2xl font-bold text-dark dark:text-white text-center">
        Verify Your Email
      </h3>
      <p className="mb-8 text-base text-body-color dark:text-white/70 text-center">
        We sent a verification code to <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <input
            type="text"
            placeholder="Enter 6-digit code"
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
            {attemptsLeft} attempts remaining
          </p>
        )}

        <div className="mb-6">
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="bg-primary w-full py-3 rounded-lg text-18 font-medium border border-primary hover:text-primary hover:bg-transparent disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      </form>
    </>
  );
}

const VerifyEmail = () => {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyEmailForm />
    </Suspense>
  );
};

export default VerifyEmail;