"use client";

import Link from "next/link";
import Logo from "@/components/Layout/Header/Logo";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const CAROUSEL_IMAGES = [
  "/images/meals/pho-bo.jpg",
  "/images/meals/banh-mi.jpg",
  "/images/meals/bun-bo-hue.jpg",
  "/images/meals/com-tam.jpg",
  "/images/meals/banh-xeo.jpg",
  "/images/meals/goi-cuon.jpg",
  "/images/meals/nem-ran.jpg",
  "/images/meals/lau-thai.jpg",
];

const INTERVAL_MS = 4500;

function HeroCarousel({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % CAROUSEL_IMAGES.length);
        setFading(false);
      }, 600);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background images */}
      {CAROUSEL_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === current ? (fading ? 0 : 1) : 0,
          }}
        />
      ))}

      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-gray-900/60" />

      {/* Content sits on top */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-5" : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

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

      {/* Hero — carousel background, no CTAs */}
      <HeroCarousel>
        <main className="flex flex-col items-center justify-center text-center px-6 py-28 max-w-3xl mx-auto w-full">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-white bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
            Quản lý bữa ăn thông minh
          </span>

          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Ăn uống lành mạnh,{" "}
            <span className="text-primary">không cần tốn công</span>
          </h1>

          <p className="text-lg text-white/75 max-w-xl leading-relaxed">
            Planeat giúp bạn lập kế hoạch bữa ăn cá nhân hóa mỗi ngày — tự động tính dinh dưỡng, phù hợp mục tiêu sức khỏe của bạn.
          </p>
        </main>
      </HeroCarousel>

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