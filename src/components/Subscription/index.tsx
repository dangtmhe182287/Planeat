// src/components/Subscription/index.tsx
"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { subscriptionAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const FEATURES = [
  { title: "Lập kế hoạch bữa ăn không giới hạn", desc: "Tạo bao nhiêu kế hoạch tùy thích" },
  { title: "Dinh dưỡng cá nhân hóa", desc: "Tính toán chính xác theo mục tiêu của bạn" },
  { title: "Thay đổi bữa ăn linh hoạt", desc: "Tùy chỉnh món ăn theo sở thích" },
  { title: "Hỗ trợ ưu tiên", desc: "Giải đáp thắc mắc nhanh chóng" },
];

const Subscription = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getStatus();
      setSubscription(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSubscription(null);
      } else {
        toast.error("Không thể tải thông tin đăng ký");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestActivation = async () => {
    setRequesting(true);
    try {
      await subscriptionAPI.requestActivation();
      toast.success("Đã gửi yêu cầu! Chúng tôi sẽ kích hoạt trong vòng 24h.");
      loadSubscription();
    } catch (error: any) {
      toast.error("Không thể gửi yêu cầu, thử lại sau.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const isActive = subscription?.status === "active";
  const isPending = subscription?.pendingRequest === true;
  const daysLeft = subscription?.subscriptionEnd
    ? Math.max(0, Math.ceil((new Date(subscription.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isExpiringSoon = isActive && daysLeft <= 7;

  // Show payment panel by default if not active, or if user clicks renew
  const paymentVisible = !isActive || showPayment;

  return (
    <section className="bg-white dark:bg-gray-900 py-20 min-h-screen">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">

        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 transition-colors"
          >
            <Icon icon="tabler:arrow-left" width="20" height="20" />
            Quay lại Dashboard
          </button>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
            Đăng ký của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Quản lý gói đăng ký của bạn
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Status */}
          <div className="space-y-6">

            {/* Status card */}
            <div className={`rounded-3xl overflow-hidden shadow-lg border-2 ${
              isActive ? "border-green-500" : "border-red-500"
            } bg-white dark:bg-gray-800`}>
              <div className={`px-8 py-6 ${isActive ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isActive ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"
                  }`}>
                    <Icon
                      icon={isActive ? "tabler:check-circle" : "tabler:x-circle"}
                      width="32" height="32"
                      className={isActive ? "text-green-600 dark:text-green-400" : "text-red-500"}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {isActive ? "Đang hoạt động" : "Đã hết hạn"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">
                {/* Expiry */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Icon icon="tabler:calendar" width="20" height="20" />
                    <span className="text-sm font-medium">
                      {isActive ? "Có hiệu lực đến" : "Hết hạn ngày"}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {subscription?.subscriptionEnd
                      ? new Date(subscription.subscriptionEnd).toLocaleDateString("vi-VN")
                      : "—"}
                  </span>
                </div>

                {/* Days left */}
                {isActive && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Icon icon="tabler:clock" width="20" height="20" />
                      <span className="text-sm font-medium">Còn lại</span>
                    </div>
                    <span className={`font-bold ${isExpiringSoon ? "text-amber-500" : "text-gray-900 dark:text-white"}`}>
                      {daysLeft} ngày
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Icon icon="tabler:credit-card" width="20" height="20" />
                    <span className="text-sm font-medium">Gói</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">99.000₫/tháng</span>
                </div>
              </div>

              {/* Renew button for active users */}
              {isActive && (
                <div className="px-8 pb-6">
                  <button
                    onClick={() => setShowPayment(!showPayment)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    <Icon icon="tabler:refresh" width="18" height="18" />
                    {showPayment ? "Ẩn thanh toán" : "Gia hạn sớm"}
                  </button>
                </div>
              )}
            </div>

            {/* Expiring soon warning */}
            {isExpiringSoon && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-5 flex items-start gap-3">
                <Icon icon="tabler:alert-triangle" width="22" height="22" className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Gói của bạn sắp hết hạn. Gia hạn sớm để không bị gián đoạn.
                </p>
              </div>
            )}

            {/* Features list */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Bao gồm trong gói</h3>
              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <Icon icon="tabler:check" className="text-green-600 dark:text-green-400" width="14" height="14" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Payment (always visible if not active, toggled if active) */}
          {paymentVisible && (
            <div className="bg-white dark:bg-gray-800 border-2 border-primary rounded-3xl overflow-hidden shadow-lg">
              <div className="bg-primary/10 dark:bg-primary/20 px-8 py-6 border-b border-primary/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thanh toán</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isActive ? "Gia hạn thêm 30 ngày" : "Kích hoạt gói Premium"}
                  </p>
                </div>
                <Icon icon="tabler:crown" width="36" height="36" className="text-primary" />
              </div>

              <div className="p-8">
                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">99.000₫</span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">/tháng</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Quét mã QR để thanh toán
                  </p>
                  <Image
                    src="/images/subscription/qrcode.jpg"
                    alt="QR Code thanh toán"
                    width={200}
                    height={200}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Nội dung chuyển khoản:{" "}
                    <span className="font-semibold">PLANEAT + email của bạn</span>
                  </p>
                </div>

                {/* Request Button */}
                <button
                  onClick={handleRequestActivation}
                  disabled={requesting || isPending}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {requesting ? (
                    <><Loader /><span>Đang gửi...</span></>
                  ) : isPending ? (
                    <><Icon icon="tabler:clock" width="20" height="20" /><span>Đang chờ xác nhận</span></>
                  ) : (
                    <><Icon icon="tabler:check" width="20" height="20" /><span>Tôi đã chuyển khoản</span></>
                  )}
                </button>

                {isPending && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Yêu cầu của bạn đang được xử lý. Tài khoản sẽ được kích hoạt trong vòng 24h.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Subscription;