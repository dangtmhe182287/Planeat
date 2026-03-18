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
  { title: "Lập kế hoạch bữa ăn không giới hạn", desc: "Tạo bao nhiêu kế hoạch tùy thích", icon: "tabler:calendar-event" },
  { title: "Dinh dưỡng cá nhân hóa",              desc: "Tính toán chính xác theo mục tiêu của bạn", icon: "tabler:chart-bar" },
  { title: "Thay đổi bữa ăn linh hoạt",           desc: "Tùy chỉnh món ăn theo sở thích", icon: "tabler:replace" },
  { title: "Hỗ trợ ưu tiên",                       desc: "Giải đáp thắc mắc nhanh chóng", icon: "tabler:headset" },
];

const Subscription = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => { loadSubscription(); }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getStatus();
      setSubscription(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) setSubscription(null);
      else toast.error("Không thể tải thông tin đăng ký");
    } finally { setLoading(false); }
  };

  const handleRequestActivation = async () => {
    setRequesting(true);
    try {
      await subscriptionAPI.requestActivation();
      toast.success("Đã gửi yêu cầu! Chúng tôi sẽ kích hoạt trong vòng 24h.");
      loadSubscription();
    } catch { toast.error("Không thể gửi yêu cầu, thử lại sau."); }
    finally { setRequesting(false); }
  };

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0f0e0d" }}><Loader /></div>
  );

  const isActive = subscription?.status === "active";
  const isPending = subscription?.pendingRequest === true;
  const daysLeft = subscription?.subscriptionEnd
    ? Math.max(0, Math.ceil((new Date(subscription.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isExpiringSoon = isActive && daysLeft <= 7;
  const paymentVisible = !isActive || showPayment;

  return (
    <div className="min-h-screen" style={{ background: "#0f0e0d", color: "#f5f0ea" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,14,13,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium transition"
            style={{ color: "rgba(245,240,234,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f5f0ea"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,234,0.5)"}>
            <Icon icon="tabler:arrow-left" width="18" height="18" />
            Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span className="text-sm font-medium text-white">Đăng ký</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Page title ── */}
        <div className="mb-10">
          <h1 className="font-bold text-white mb-1" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", letterSpacing: "-0.02em" }}>
            Đăng ký của tôi
          </h1>
          <p style={{ color: "rgba(245,240,234,0.45)", fontSize: "0.95rem" }}>Quản lý gói đăng ký của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">

            {/* Status card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1714", border: `1px solid ${isActive ? "rgba(42,157,143,0.35)" : "rgba(231,111,81,0.35)"}` }}>
              <div className="px-6 py-5 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: isActive ? "rgba(42,157,143,0.08)" : "rgba(231,111,81,0.08)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? "rgba(42,157,143,0.2)" : "rgba(231,111,81,0.2)" }}>
                  <Icon icon={isActive ? "tabler:check-circle" : "tabler:x-circle"} width="28" height="28"
                    style={{ color: isActive ? "#2a9d8f" : "#e76f51" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "rgba(245,240,234,0.45)" }}>Trạng thái</p>
                  <p className="font-bold text-white text-lg">{isActive ? "Đang hoạt động" : "Đã hết hạn"}</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {[
                  { icon: "tabler:calendar", label: isActive ? "Có hiệu lực đến" : "Hết hạn ngày", value: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString("vi-VN") : "—" },
                  ...(isActive ? [{ icon: "tabler:clock", label: "Còn lại", value: `${daysLeft} ngày`, warn: isExpiringSoon }] : []),
                  { icon: "tabler:credit-card", label: "Gói", value: "99.000₫/tháng" },
                ].map((row: any) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon icon={row.icon} width="18" height="18" style={{ color: "rgba(245,240,234,0.35)" }} />
                      <span className="text-sm" style={{ color: "rgba(245,240,234,0.55)" }}>{row.label}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: row.warn ? "#e9c46a" : "#f5f0ea" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {isActive && (
                <div className="px-6 pb-6">
                  <button onClick={() => setShowPayment(!showPayment)}
                    className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl transition"
                    style={{ border: "1px solid rgba(232,103,58,0.4)", color: "#e8673a", background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,103,58,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <Icon icon="tabler:refresh" width="16" height="16" />
                    {showPayment ? "Ẩn thanh toán" : "Gia hạn sớm"}
                  </button>
                </div>
              )}
            </div>

            {/* Expiring warning */}
            {isExpiringSoon && (
              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "rgba(233,196,106,0.08)", border: "1px solid rgba(233,196,106,0.25)" }}>
                <Icon icon="tabler:alert-triangle" width="20" height="20" style={{ color: "#e9c46a", flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: "#e9c46a" }}>Gói của bạn sắp hết hạn. Gia hạn sớm để không bị gián đoạn.</p>
              </div>
            )}

            {/* Features */}
            <div className="rounded-2xl p-6" style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="font-bold text-white mb-4 text-sm">Bao gồm trong gói</h3>
              <div className="space-y-3">
                {FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(42,157,143,0.15)" }}>
                      <Icon icon={f.icon} width="14" height="14" style={{ color: "#2a9d8f" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-xs" style={{ color: "rgba(245,240,234,0.4)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column — Payment ── */}
          {paymentVisible && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1714", border: "1px solid rgba(232,103,58,0.3)" }}>
              <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(232,103,58,0.08)" }}>
                <div>
                  <h2 className="font-bold text-white text-lg">Thanh toán</h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,234,0.5)" }}>{isActive ? "Gia hạn thêm 30 ngày" : "Kích hoạt gói Premium"}</p>
                </div>
                <Icon icon="tabler:crown" width="32" height="32" style={{ color: "#e8673a" }} />
              </div>

              <div className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-bold text-white" style={{ fontSize: "2.8rem", letterSpacing: "-0.02em" }}>99.000₫</span>
                    <span className="text-sm" style={{ color: "rgba(245,240,234,0.4)" }}>/tháng</span>
                  </div>
                </div>

                {/* QR */}
                <div className="flex flex-col items-center rounded-2xl p-6 mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm font-medium mb-4" style={{ color: "rgba(245,240,234,0.6)" }}>Quét mã QR để thanh toán</p>
                  <div className="rounded-xl overflow-hidden bg-white p-2">
                    <Image src="/images/subscription/qrcode.jpg" alt="QR Code" width={180} height={180} className="rounded-lg" />
                  </div>
                  <p className="text-xs text-center mt-4" style={{ color: "rgba(245,240,234,0.4)" }}>
                    Nội dung: <span className="font-semibold text-white">PLANEAT + email của bạn</span>
                  </p>
                </div>

                {/* CTA */}
                <button onClick={handleRequestActivation} disabled={requesting || isPending}
                  className="w-full flex items-center justify-center gap-2 font-semibold text-base py-4 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#e8673a", color: "#fff", boxShadow: "0 4px 20px rgba(232,103,58,0.35)" }}
                  onMouseEnter={e => { if (!requesting && !isPending) e.currentTarget.style.background = "#d45e32"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#e8673a"; }}>
                  {requesting ? (
                    <><Loader /><span>Đang gửi...</span></>
                  ) : isPending ? (
                    <><Icon icon="tabler:clock" width="20" height="20" /><span>Đang chờ xác nhận</span></>
                  ) : (
                    <><Icon icon="tabler:check" width="20" height="20" /><span>Tôi đã chuyển khoản</span></>
                  )}
                </button>

                {isPending && (
                  <p className="text-xs text-center mt-3" style={{ color: "rgba(245,240,234,0.4)" }}>
                    Yêu cầu đang được xử lý. Tài khoản sẽ được kích hoạt trong vòng 24h.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Subscription;