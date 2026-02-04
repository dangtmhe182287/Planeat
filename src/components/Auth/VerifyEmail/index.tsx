"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { authAPI } from "@/utils/api";

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyEmail({ email, code });
      toast.success(response.data.message || "Email verified successfully!");
      router.push("/signin");
    } catch (error: any) {
      const message = error.response?.data?.message || "Verification failed";
      toast.error(message);
      
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]">
              <div className="mb-10 text-center">
                <Logo />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-dark dark:text-white">
                Verify Your Email
              </h3>
              <p className="mb-8 text-base text-body-color dark:text-dark-6">
                We sent a verification code to <strong>{email}</strong>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-[22px]">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-center text-2xl tracking-widest text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                  />
                </div>

                {attemptsLeft < 5 && (
                  <p className="mb-4 text-sm text-red-500">
                    {attemptsLeft} attempts remaining
                  </p>
                )}

                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-opacity-90 disabled:opacity-50"
                  >
                    Verify Email {loading && <Loader />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;