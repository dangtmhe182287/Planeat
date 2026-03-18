"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { profileAPI, mealPlanAPI, subscriptionAPI, removeAuthToken } from "@/utils/api";
import { Icon } from "@iconify/react";
import Loader from "@/components/Common/Loader";
import Logo from "@/components/Layout/Header/Logo";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      try {
        const subRes = await subscriptionAPI.getStatus();
        if (subRes.data?.status !== "active") { router.push("/subscription"); return; }
      } catch { router.push("/subscription"); return; }

      const profileRes = await profileAPI.get();
      setProfile(profileRes.data);

      try {
        const planRes = await mealPlanAPI.get(todayDate);
        setMealPlan(planRes.data);
      } catch (error: any) {
        if (error.response?.status === 404) { setLoading(false); handleGeneratePlan(); return; }
        setMealPlan(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      if (mealPlan) { try { await mealPlanAPI.delete(todayDate); } catch {} }
      const response = await mealPlanAPI.generate({ date: todayDate });
      setMealPlan(response.data.plan);
      toast.success("Đã tạo thực đơn thành công!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tạo thực đơn";
      if (error.response?.status === 403 && message.includes('already exists')) {
        try {
          await mealPlanAPI.delete(todayDate);
          const response = await mealPlanAPI.generate({ date: todayDate });
          setMealPlan(response.data.plan);
          toast.success("Đã tạo lại thực đơn thành công!");
          return;
        } catch { toast.error("Không thể tạo lại thực đơn"); }
      } else { toast.error(message); }
    } finally { setGenerating(false); }
  };

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0f0e0d" }}><Loader /></div>
  );

  const todayFormatted = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen" style={{ background: "#0f0e0d", color: "#f5f0ea" }}>
      <style>{`
        .action-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .generate-btn { transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(232,103,58,0.3); }
        .generate-btn:hover { box-shadow: 0 8px 32px rgba(232,103,58,0.5); transform: translateY(-1px); }
        .generate-btn:disabled { box-shadow: none; transform: none; }
      `}</style>

      {/* ── Top nav ── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,14,13,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/settings")}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition"
              style={{ color: "rgba(245,240,234,0.6)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f5f0ea"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,240,234,0.6)"; e.currentTarget.style.background = "transparent"; }}>
              <Icon icon="tabler:settings" width="18" height="18" />
              Cài đặt
            </button>
            <button onClick={() => router.push("/subscription")}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition"
              style={{ color: "rgba(245,240,234,0.6)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f5f0ea"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,240,234,0.6)"; e.currentTarget.style.background = "transparent"; }}>
              <Icon icon="tabler:crown" width="18" height="18" />
              Đăng ký
            </button>
            <button onClick={() => { removeAuthToken(); router.push("/"); }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition"
              style={{ color: "rgba(245,240,234,0.4)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#e8673a"; e.currentTarget.style.background = "rgba(232,103,58,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,240,234,0.4)"; e.currentTarget.style.background = "transparent"; }}>
              <Icon icon="tabler:logout" width="18" height="18" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Greeting ── */}
        <div className="mb-10">
          <p className="text-sm font-medium mb-1" style={{ color: "#e8673a" }}>{todayFormatted}</p>
          <h1 className="font-bold text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.02em" }}>
            Chào {profile?.name || "bạn"} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(245,240,234,0.45)" }}>Hôm nay bạn sẽ ăn gì?</p>
        </div>

        {/* ── Nutrition targets ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Calo mục tiêu", value: profile?.targetCalories || 0, unit: "", icon: "tabler:flame", color: "#e8673a" },
            { label: "Protein",       value: profile?.targetProtein  || 0, unit: "g", icon: "tabler:meat", color: "#4a90d9" },
            { label: "Carbs",         value: profile?.targetCarbs    || 0, unit: "g", icon: "tabler:bread", color: "#d4a853" },
            { label: "Chất béo",      value: profile?.targetFat      || 0, unit: "g", icon: "tabler:droplet", color: "#5e9e6e" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                <Icon icon={s.icon} width="20" height="20" style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">{s.value}{s.unit}</p>
                <p className="text-xs" style={{ color: "rgba(245,240,234,0.45)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Meal plan ── */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e8673a" }}>Kế hoạch hôm nay</span>
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="generate-btn flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl text-white disabled:opacity-50"
            style={{ background: "#e8673a" }}
          >
            {generating ? <Loader /> : <Icon icon="tabler:refresh" width="18" height="18" />}
            {mealPlan ? "Tạo lại" : "Tạo kế hoạch"}
          </button>
        </div>

        {!mealPlan ? (
          generating ? (
            <div className="rounded-2xl p-16 flex flex-col items-center gap-4" style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Loader />
              <p style={{ color: "rgba(245,240,234,0.45)", fontSize: "0.9rem" }}>Đang tạo thực đơn cho bạn...</p>
            </div>
          ) : (
            <div className="rounded-2xl p-16 flex flex-col items-center gap-4 text-center" style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(232,103,58,0.12)", border: "1px solid rgba(232,103,58,0.2)" }}>
                <Icon icon="tabler:chef-hat" width="32" height="32" style={{ color: "#e8673a" }} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Chưa có kế hoạch bữa ăn</h3>
                <p className="text-sm" style={{ color: "rgba(245,240,234,0.45)" }}>Nhấn "Tạo kế hoạch" để bắt đầu</p>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard meal={mealPlan.breakfast} type="Bữa sáng" icon="tabler:sun" />
            <MealCard meal={mealPlan.lunch}     type="Bữa trưa" icon="tabler:sun-high" />
            <MealCard meal={mealPlan.dinner}    type="Bữa tối"  icon="tabler:moon" />
          </div>
        )}
      </main>
    </div>
  );
};

const dishTypeLabel: Record<string, string> = {
  rice: 'Cơm', main: 'Món chính', side: 'Món phụ',
  vegetable: 'Rau', soup: 'Canh', complete_meal: 'Món hoàn chỉnh',
};

const calcNutrition = (dish: any) => {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  (dish.ingredients || []).forEach((ing: any) => {
    if (ing.ingredientId) {
      const m = (ing.amount || 0) / 100;
      calories += (ing.ingredientId.caloriesPer100g || 0) * m;
      protein  += (ing.ingredientId.proteinPer100g  || 0) * m;
      carbs    += (ing.ingredientId.carbsPer100g    || 0) * m;
      fat      += (ing.ingredientId.fatPer100g      || 0) * m;
    }
  });
  return { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
};

const DishCard = ({ dish }: { dish: any }) => {
  const [showDetails, setShowDetails] = useState(false);
  const nutrition = calcNutrition(dish);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex">
        <div className="relative w-28 flex-shrink-0" style={{ minHeight: 110, background: "#1a1714" }}>
          {dish.imageUrl ? (
            <Image src={dish.imageUrl} alt={dish.name} fill sizes="112px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon icon="tabler:bowl-chopsticks" width="28" height="28" style={{ color: "rgba(245,240,234,0.2)" }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{dish.name}</p>
            <span className="text-xs" style={{ color: "rgba(245,240,234,0.4)" }}>{dishTypeLabel[dish.dishType] || dish.dishType}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            {[
              { label: 'Calo',    value: `${nutrition.calories}` },
              { label: 'Protein', value: `${nutrition.protein}g` },
              { label: 'Carbs',   value: `${nutrition.carbs}g` },
              { label: 'Béo',     value: `${nutrition.fat}g` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg py-1 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "10px", color: "rgba(245,240,234,0.4)" }}>{label}</p>
                <p className="font-bold text-white" style={{ fontSize: "11px" }}>{value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-xs font-medium flex items-center gap-1 transition"
            style={{ color: "rgba(245,240,234,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#e8673a"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,234,0.4)"}>
            {showDetails ? "Ẩn" : "Hiện"} chi tiết
            <Icon icon={showDetails ? "tabler:chevron-up" : "tabler:chevron-down"} width="12" height="12" />
          </button>
        </div>
      </div>
      {showDetails && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {dish.ingredients?.length > 0 && (
            <ul className="space-y-1 mb-3">
              {dish.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "rgba(245,240,234,0.5)" }}>
                  <span style={{ color: "#e8673a" }}>•</span>
                  {ing.ingredientId?.name || 'Không rõ'} — {ing.amount}g
                </li>
              ))}
            </ul>
          )}
          {dish.instructions?.length > 0 && (
            <ol className="space-y-1 list-decimal list-inside">
              {dish.instructions.map((step: string, idx: number) => (
                <li key={idx} className="text-xs" style={{ color: "rgba(245,240,234,0.4)" }}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};

const MealCard = ({ meal, type, icon }: { meal: any; type: string; icon: string }) => {
  if (!meal) return (
    <div className="rounded-2xl p-6" style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon icon={icon} width="18" height="18" style={{ color: "#e8673a" }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#e8673a" }}>{type}</span>
      </div>
      <p className="text-sm" style={{ color: "rgba(245,240,234,0.4)" }}>Chưa có bữa ăn</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1714", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Icon icon={icon} width="16" height="16" style={{ color: "#e8673a" }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#e8673a" }}>{type}</span>
      </div>
      <div className="p-3 flex flex-col gap-3">
        {meal.dishes?.map((dish: any, idx: number) => (
          <DishCard key={idx} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;