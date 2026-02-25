// src/components/Landing/index.tsx
// Landing page shown to unauthenticated visitors at "/"
// ─────────────────────────────────────────────────────
// Sections (in order):
//   1. HEADER      — logo + sign-in / sign-up buttons
//   2. HERO        — headline, subtext, primary CTAs
//   3. FEATURES    — 3 feature cards (add/remove cards in the `features` array below)
//   4. CTA FOOTER  — bottom call-to-action before the page ends
//
// To add a new feature card: add an object to the `features` array with icon, title, desc.
// Icons come from Iconify (tabler set) — browse at https://icon-sets.iconify.design/tabler/

import Link from "next/link";
import Logo from "@/components/Layout/Header/Logo";
import { Icon } from "@iconify/react";

const features = [
  {
    icon: "tabler:chart-bar",
    title: "Theo dõi dinh dưỡng",
    desc: "Tự động tính toán calo, protein, carbs và chất béo cho từng bữa ăn theo mục tiêu cá nhân của bạn.",
  },
  {
    icon: "tabler:calendar-event",
    title: "Lập kế hoạch tự động",
    desc: "Tạo thực đơn hàng ngày chỉ với một cú nhấp — phù hợp với sở thích và nhu cầu dinh dưỡng của bạn.",
  },
  {
    icon: "tabler:replace",
    title: "Linh hoạt thay đổi",
    desc: "Không thích món nào? Dễ dàng hoán đổi từng bữa để thực đơn luôn hợp khẩu vị.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary px-5 py-2.5 rounded-xl transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded-xl transition-colors"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto w-full">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
          Quản lý bữa ăn thông minh
        </span>

        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          Ăn uống lành mạnh,{" "}
          <span className="text-primary">không cần tốn công</span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-10 leading-relaxed">
          Planeat giúp bạn lập kế hoạch bữa ăn cá nhân hóa mỗi ngày — tự động tính dinh dưỡng, phù hợp mục tiêu sức khỏe của bạn.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Bắt đầu miễn phí
            <Icon icon="tabler:arrow-right" width="20" height="20" />
          </Link>
          <Link
            href="/signin"
            className="flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Tất cả những gì bạn cần
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon icon={f.icon} width="24" height="24" className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Dùng thử miễn phí 7 ngày. Không cần thanh toán.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Tạo tài khoản ngay
            <Icon icon="tabler:arrow-right" width="20" height="20" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Landing;