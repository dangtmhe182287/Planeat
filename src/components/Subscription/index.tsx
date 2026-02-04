"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { subscriptionAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const Subscription = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelSubscription = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đăng ký?")) {
      return;
    }

    setCancelling(true);
    try {
      await subscriptionAPI.cancel();
      toast.success("Đã hủy đăng ký");
      loadSubscription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đăng ký");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trial";

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
            Quản lý đăng ký
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {subscription ? "Thông tin gói đăng ký của bạn" : "Nâng cấp để mở khóa tất cả tính năng"}
          </p>
        </div>

        {!subscription ? (
          // No Subscription - Show Pricing
          <div className="max-w-2xl mx-auto">
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-2 border-primary rounded-3xl overflow-hidden shadow-lg mb-8">
              <div className="bg-primary/10 dark:bg-primary/20 px-8 py-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Gói Premium
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Dùng thử miễn phí 7 ngày
                    </p>
                  </div>
                  <Icon icon="tabler:crown" width="48" height="48" className="text-primary" />
                </div>
              </div>

              <div className="p-8">
                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$9.99</span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/tháng</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sau khi kết thúc dùng thử
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mt-0.5">
                      <Icon icon="tabler:check" className="text-green-600 dark:text-green-400" width="16" height="16" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Kế hoạch bữa ăn không giới hạn</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tạo bao nhiêu kế hoạch tùy thích</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mt-0.5">
                      <Icon icon="tabler:check" className="text-green-600 dark:text-green-400" width="16" height="16" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Dinh dưỡng cá nhân hóa</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tính toán chính xác theo mục tiêu của bạn</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mt-0.5">
                      <Icon icon="tabler:check" className="text-green-600 dark:text-green-400" width="16" height="16" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Thay đổi bữa ăn linh hoạt</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tùy chỉnh món ăn theo sở thích</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mt-0.5">
                      <Icon icon="tabler:check" className="text-green-600 dark:text-green-400" width="16" height="16" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Hỗ trợ ưu tiên</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Giải đáp thắc mắc nhanh chóng</p>
                    </div>
                  </div>
                </div>

                {/* PayPal Button */}
                <div id="paypal-button-container" className="mb-4"></div>

                {/* Terms */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Bằng cách đăng ký, bạn đồng ý với{" "}
                  <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a>
                  {" "}và{" "}
                  <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
                </p>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
                <Icon icon="tabler:lock" width="32" height="32" className="mx-auto mb-3 text-primary" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Bảo mật</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Thanh toán an toàn</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
                <Icon icon="tabler:refresh" width="32" height="32" className="mx-auto mb-3 text-primary" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Linh hoạt</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hủy bất cứ lúc nào</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
                <Icon icon="tabler:headset" width="32" height="32" className="mx-auto mb-3 text-primary" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Hỗ trợ 24/7</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Luôn sẵn sàng giúp đỡ</p>
              </div>
            </div>
          </div>
        ) : (
          // Active Subscription
          <div className="max-w-2xl mx-auto">
            {/* Status Card */}
            <div className={`rounded-3xl overflow-hidden shadow-lg mb-8 ${
              isActive 
                ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-2 border-green-500" 
                : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 border-2 border-red-500"
            }`}>
              <div className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  isActive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  <Icon
                    icon={isActive ? "tabler:check-circle" : "tabler:x-circle"}
                    width="48"
                    height="48"
                    className={isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                  />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {subscription.status === "trial" ? "Đang dùng thử miễn phí" : "Đăng ký đang hoạt động"}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400">
                  Trạng thái:{" "}
                  <span className="font-semibold">
                    {subscription.status === "trial" 
                      ? "Dùng thử" 
                      : subscription.status === "active" 
                      ? "Hoạt động" 
                      : subscription.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Chi tiết đăng ký
              </h3>

              <div className="space-y-4">
                {subscription.trialEndDate && subscription.status === "trial" && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon icon="tabler:calendar" width="24" height="24" className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Kết thúc dùng thử</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(subscription.trialEndDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}

                {subscription.lastPaymentDate && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon icon="tabler:credit-card" width="24" height="24" className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Thanh toán lần cuối</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(subscription.lastPaymentDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon icon="tabler:currency-dollar" width="24" height="24" className="text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Giá gói</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">$9.99/tháng</span>
                </div>
              </div>
            </div>

            {/* Active Features */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Tính năng đang sử dụng
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Icon icon="tabler:check" className="text-primary" width="20" height="20" />
                  <span className="text-gray-900 dark:text-white">Kế hoạch không giới hạn</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="tabler:check" className="text-primary" width="20" height="20" />
                  <span className="text-gray-900 dark:text-white">Dinh dưỡng cá nhân hóa</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="tabler:check" className="text-primary" width="20" height="20" />
                  <span className="text-gray-900 dark:text-white">Thay đổi bữa ăn</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="tabler:check" className="text-primary" width="20" height="20" />
                  <span className="text-gray-900 dark:text-white">Hỗ trợ ưu tiên</span>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {isActive && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Icon icon="tabler:info-circle" width="24" height="24" className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Muốn hủy đăng ký?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Bạn sẽ vẫn có thể sử dụng các tính năng premium cho đến hết kỳ thanh toán hiện tại.
                    </p>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {cancelling ? (
                        <>
                          <Loader />
                          <span>Đang hủy...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="tabler:x" width="20" height="20" />
                          <span>Hủy đăng ký</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PayPal SDK */}
      <script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        data-sdk-integration-source="button-factory"
      ></script>
    </section>
  );
};

export default Subscription;