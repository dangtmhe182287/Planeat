"use client";

import Link from "next/link";
import Logo from "@/components/Layout/Header/Logo";
import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";

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
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (transitioning) return;
      setTransitioning(true);
      setCurrent(c => (c + 1) % CAROUSEL_IMAGES.length);
      setTimeout(() => setTransitioning(false), 900);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [transitioning]);

  const goTo = (i: number) => {
    if (transitioning || i === current) return;
    setTransitioning(true);
    setCurrent(i);
    setTimeout(() => setTransitioning(false), 900);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
      {CAROUSEL_IMAGES.map((src, i) => (
        <div key={src} className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})`, opacity: i === current ? 1 : 0, transition: "opacity 0.9s ease-in-out", zIndex: i === current ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(10,10,10,0.72) 0%, rgba(20,12,5,0.55) 50%, rgba(10,10,10,0.78) 100%)", zIndex: 2 }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.45) 100%)", zIndex: 3 }} />
      <div className="relative" style={{ zIndex: 4 }}>{children}</div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 5 }}>
        {CAROUSEL_IMAGES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
            style={{ height: "6px", width: i === current ? "28px" : "6px", borderRadius: "999px", background: i === current ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", transition: "all 0.35s ease", padding: 0 }}
          />
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: "tabler:chart-bar",     title: "Theo dõi dinh dưỡng",    desc: "Tự động tính toán calo, protein, carbs và chất béo cho từng bữa ăn theo mục tiêu cá nhân.", accent: "#e8673a" },
  { icon: "tabler:calendar-event",title: "Lập kế hoạch tự động",   desc: "Tạo thực đơn hàng ngày chỉ với một cú nhấp — phù hợp sở thích và nhu cầu dinh dưỡng.",    accent: "#d4a853" },
  { icon: "tabler:replace",       title: "Linh hoạt thay đổi",     desc: "Không thích món nào? Dễ dàng hoán đổi từng bữa để thực đơn luôn hợp khẩu vị.",            accent: "#5e9e6e" },
];

const stats = [
  { value: "100+",  label: "Món ăn Việt" },
  { value: "3",     label: "Bữa mỗi ngày" },
  { value: "100%",  label: "Cá nhân hóa" },
];

const steps = [
  { num: "01", icon: "tabler:target",        title: "Thiết lập mục tiêu",   desc: "Cho chúng tôi biết về bạn — chiều cao, cân nặng, mục tiêu và thói quen ăn uống." },
  { num: "02", icon: "tabler:sparkles",      title: "Nhận thực đơn",        desc: "Planeat tự động tạo thực đơn 3 bữa mỗi ngày, tối ưu cho mục tiêu dinh dưỡng của bạn." },
  { num: "03", icon: "tabler:map-pin",       title: "Tìm món ở gần bạn",    desc: "Mỗi món được gợi ý đều là món ăn phổ biến, dễ tìm tại các quán ăn địa phương quanh bạn." },
];

const samplePlan = {
  breakfast: { name: "Phở bò", cal: 480, protein: 32, carbs: 58, fat: 12, image: "/images/meals/pho-bo.jpg" },
  lunch:     { name: "Cơm tấm sườn bì chả", cal: 620, protein: 38, carbs: 72, fat: 18, image: "/images/meals/com-tam.jpg" },
  dinner:    { name: "Bún bò Huế", cal: 520, protein: 34, carbs: 65, fat: 14, image: "/images/meals/bun-bo-hue.jpg" },
};

const faqs = [
  { q: "Planeat có miễn phí không?",               a: "Planeat có gói dùng thử miễn phí 7 ngày. Sau đó bạn có thể chọn tiếp tục với gói trả phí để mở khóa đầy đủ tính năng." },
  { q: "Tôi có cần tự nấu ăn không?",              a: "Không cần. Planeat gợi ý những món ăn phổ biến mà bạn dễ dàng tìm thấy tại các quán ăn, căng tin hoặc cửa hàng gần nhà." },
  { q: "Thực đơn có phù hợp với người ăn chay không?", a: "Có. Trong quá trình thiết lập, bạn có thể chọn chế độ ăn chay hoặc thuần chay — thực đơn sẽ được điều chỉnh hoàn toàn theo đó." },
  { q: "Tôi có thể đổi món nếu không thích không?", a: "Hiện tại bạn có thể tạo lại toàn bộ thực đơn trong ngày nếu không ưng ý. Tính năng hoán đổi từng bữa riêng lẻ đang được phát triển và sẽ sớm có mặt." },
  { q: "Dữ liệu của tôi có được bảo mật không?",   a: "Có. Thông tin cá nhân và sức khỏe của bạn chỉ được dùng để tạo thực đơn cá nhân hóa và không được chia sẻ với bên thứ ba." },
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const Landing = () => {
  const statsAnim    = useInView();
  const featuresAnim = useInView();
  const stepsAnim    = useInView();
  const sampleAnim   = useInView();
  const faqAnim      = useInView();
  const ctaAnim      = useInView();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0e0d", color: "#f5f0ea" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .hero-badge { animation: fadeIn 0.8s ease 0.2s both; }
        .hero-h1    { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.35s both; }
        .hero-p     { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.5s both; }
        .hero-cta   { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.65s both; }
        .feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.28); }
        .cta-btn-primary { transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(232,103,58,0.35); }
        .cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,103,58,0.5); background: #d45e32 !important; }
        .cta-btn-secondary { transition: all 0.2s ease; }
        .cta-btn-secondary:hover { background: rgba(255,255,255,0.08); }
        .nav-signin { transition: color 0.2s ease; }
        .nav-signin:hover { color: #e8673a; }
        .faq-item { transition: background 0.2s ease; }
        .faq-item:hover { background: rgba(255,255,255,0.04) !important; }
        .step-line { background: linear-gradient(180deg, #e8673a 0%, transparent 100%); }
      `}</style>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "linear-gradient(180deg, rgba(15,14,13,0.92) 0%, transparent 100%)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/signin" className="nav-signin text-sm font-medium" style={{ color: "rgba(245,240,234,0.65)" }}>Đăng nhập</Link>
            <Link href="/signup" className="cta-btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl" style={{ background: "#e8673a", color: "#fff" }}>Đăng ký miễn phí</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <HeroCarousel>
        <main className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "92vh", paddingTop: "80px" }}>
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            <span className="hero-badge inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8"
              style={{ background: "rgba(232,103,58,0.18)", border: "1px solid rgba(232,103,58,0.4)", color: "#f0a882", backdropFilter: "blur(8px)" }}>
              <Icon icon="tabler:leaf" width="14" height="14" />
              Quản lý bữa ăn thông minh
            </span>
            <h1 className="hero-h1 font-bold text-white leading-tight mb-6"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", letterSpacing: "-0.02em" }}>
              Ăn uống lành mạnh,{" "}
              <span style={{ background: "linear-gradient(90deg, #e8673a, #d4a853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                không cần tốn công
              </span>
            </h1>
            <p className="hero-p text-lg leading-relaxed mb-10 max-w-xl" style={{ color: "rgba(255,255,255,0.65)" }}>
              Planeat giúp bạn lập kế hoạch bữa ăn cá nhân hóa mỗi ngày — tự động tính dinh dưỡng, phù hợp mục tiêu sức khỏe.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-3 items-center">
              <Link href="/signup" className="cta-btn-primary inline-flex items-center gap-2 font-semibold text-base px-8 py-4 rounded-xl" style={{ background: "#e8673a", color: "#fff" }}>
                Bắt đầu miễn phí <Icon icon="tabler:arrow-right" width="20" height="20" />
              </Link>
              <Link href="/signin" className="cta-btn-secondary inline-flex items-center gap-2 font-medium text-base px-8 py-4 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
                Đăng nhập
              </Link>
            </div>
          </div>
        </main>
      </HeroCarousel>

      {/* ── Stats ── */}
      <div ref={statsAnim.ref} style={{ background: "#1a1714", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center text-center"
              style={{ opacity: statsAnim.inView ? 1 : 0, transform: statsAnim.inView ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s` }}>
              <span className="font-bold mb-1" style={{ fontSize: "2rem", color: "#e8673a", letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="text-sm" style={{ color: "rgba(245,240,234,0.45)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section ref={stepsAnim.ref} style={{ background: "#0f0e0d", padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: "#e8673a" }}>Cách hoạt động</span>
            <h2 className="font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#f5f0ea", letterSpacing: "-0.02em" }}>
              Chỉ 3 bước đơn giản
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center text-center"
                style={{ opacity: stepsAnim.inView ? 1 : 0, transform: stepsAnim.inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${i * 0.15}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${i * 0.15}s` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(232,103,58,0.12)", border: "1px solid rgba(232,103,58,0.25)" }}>
                    <Icon icon={s.icon} width="28" height="28" style={{ color: "#e8673a" }} />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: "#e8673a", color: "#fff", fontSize: "0.65rem" }}>{s.num}</span>
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#f5f0ea", fontSize: "1.05rem" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,234,0.5)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresAnim.ref} style={{ background: "#131110", padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: "#e8673a" }}>Tính năng</span>
            <h2 className="font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#f5f0ea", letterSpacing: "-0.02em" }}>Tất cả những gì bạn cần</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="feature-card rounded-2xl p-7"
                style={{ background: "#1c1916", border: "1px solid rgba(255,255,255,0.07)", opacity: featuresAnim.inView ? 1 : 0, transform: featuresAnim.inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${i * 0.13}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${i * 0.13}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.accent}18` }}>
                  <Icon icon={f.icon} width="24" height="24" style={{ color: f.accent }} />
                </div>
                <h3 className="font-bold mb-2" style={{ fontSize: "1.05rem", color: "#f5f0ea" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,234,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample meal plan ── */}
      <section ref={sampleAnim.ref} style={{ background: "#0f0e0d", padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: "#e8673a" }}>Ví dụ thực đơn</span>
            <h2 className="font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#f5f0ea", letterSpacing: "-0.02em" }}>Một ngày ăn uống cùng Planeat</h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(245,240,234,0.45)" }}>Thực đơn mẫu cho người 25 tuổi, mục tiêu duy trì cân nặng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Bữa sáng", icon: "tabler:sun", meal: samplePlan.breakfast },
              { label: "Bữa trưa", icon: "tabler:sun-high", meal: samplePlan.lunch },
              { label: "Bữa tối", icon: "tabler:moon", meal: samplePlan.dinner },
            ].map((slot, i) => (
              <div key={slot.label}
                style={{ opacity: sampleAnim.inView ? 1 : 0, transform: sampleAnim.inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${i * 0.15}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${i * 0.15}s`, background: "#1c1916", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", overflow: "hidden" }}>
                {/* Image */}
                <div style={{ height: 160, backgroundImage: `url(${slot.meal.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
                  <div className="absolute bottom-0 left-0 px-4 pb-3 flex items-center gap-2">
                    <Icon icon={slot.icon} width="14" height="14" style={{ color: "#e8673a" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#f0a882" }}>{slot.label}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold mb-3" style={{ color: "#f5f0ea", fontSize: "0.95rem" }}>{slot.meal.name}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Calo", value: slot.meal.cal },
                      { label: "Protein", value: `${slot.meal.protein}g` },
                      { label: "Carbs", value: `${slot.meal.carbs}g` },
                      { label: "Béo", value: `${slot.meal.fat}g` },
                    ].map(n => (
                      <div key={n.label} className="text-center rounded-xl py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="font-bold text-sm" style={{ color: "#f5f0ea" }}>{n.value}</div>
                        <div className="text-xs" style={{ color: "rgba(245,240,234,0.4)" }}>{n.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily total */}
          <div className="mt-6 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
            style={{ background: "#1c1916", border: "1px solid rgba(232,103,58,0.2)" }}>
            <span className="text-sm font-semibold" style={{ color: "rgba(245,240,234,0.6)" }}>Tổng cả ngày</span>
            <div className="flex gap-6">
              {[
                { label: "Calo", value: `${samplePlan.breakfast.cal + samplePlan.lunch.cal + samplePlan.dinner.cal}` },
                { label: "Protein", value: `${samplePlan.breakfast.protein + samplePlan.lunch.protein + samplePlan.dinner.protein}g` },
                { label: "Carbs", value: `${samplePlan.breakfast.carbs + samplePlan.lunch.carbs + samplePlan.dinner.carbs}g` },
                { label: "Béo", value: `${samplePlan.breakfast.fat + samplePlan.lunch.fat + samplePlan.dinner.fat}g` },
              ].map(n => (
                <div key={n.label} className="text-center">
                  <div className="font-bold" style={{ color: "#e8673a", fontSize: "1.1rem" }}>{n.value}</div>
                  <div className="text-xs" style={{ color: "rgba(245,240,234,0.4)" }}>{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqAnim.ref} style={{ background: "#131110", padding: "80px 24px" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: "#e8673a" }}>Câu hỏi thường gặp</span>
            <h2 className="font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#f5f0ea", letterSpacing: "-0.02em" }}>Bạn đang thắc mắc điều gì?</h2>
          </div>
          <div className="flex flex-col gap-3"
            style={{ opacity: faqAnim.inView ? 1 : 0, transform: faqAnim.inView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)" }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item rounded-2xl overflow-hidden"
                style={{ background: "#1c1916", border: `1px solid ${openFaq === i ? "rgba(232,103,58,0.35)" : "rgba(255,255,255,0.07)"}`, transition: "border 0.2s ease" }}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-sm" style={{ color: openFaq === i ? "#e8673a" : "#f5f0ea" }}>{faq.q}</span>
                  <Icon icon={openFaq === i ? "tabler:minus" : "tabler:plus"} width="18" height="18"
                    style={{ color: openFaq === i ? "#e8673a" : "rgba(245,240,234,0.4)", flexShrink: 0, marginLeft: 12, transition: "color 0.2s ease" }} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,234,0.55)" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaAnim.ref}
        style={{ background: "linear-gradient(135deg, #1e1410 0%, #1a1208 50%, #1e1410 100%)", borderTop: "1px solid rgba(232,103,58,0.12)", padding: "80px 24px" }}>
        <div className="max-w-xl mx-auto text-center"
          style={{ opacity: ctaAnim.inView ? 1 : 0, transform: ctaAnim.inView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "rgba(232,103,58,0.12)", border: "1px solid rgba(232,103,58,0.25)" }}>
            <Icon icon="tabler:salad" width="28" height="28" style={{ color: "#e8673a" }} />
          </div>
          <h2 className="font-bold mb-3" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#f5f0ea", letterSpacing: "-0.02em" }}>Sẵn sàng bắt đầu?</h2>
          <p className="mb-8" style={{ color: "rgba(245,240,234,0.45)", fontSize: "0.95rem" }}>Dùng thử miễn phí 7 ngày. Không cần thanh toán.</p>
          <Link href="/signup" className="cta-btn-primary inline-flex items-center gap-2 font-semibold text-base px-8 py-4 rounded-xl" style={{ background: "#e8673a", color: "#fff" }}>
            Tạo tài khoản ngay <Icon icon="tabler:arrow-right" width="20" height="20" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0f0e0d", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "rgba(245,240,234,0.25)", fontSize: "0.8rem" }}>© {new Date().getFullYear()} Planeat. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;