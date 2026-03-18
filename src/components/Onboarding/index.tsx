// Onboarding component — split steps, dark card theme
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { profileAPI, preferencesAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const TOTAL_STEPS = 12;

// ── Data ─────────────────────────────────────────────────
const goalOptions = [
  { value: "lose",     label: "Giảm cân",        icon: "tabler:trending-down" },
  { value: "maintain", label: "Duy trì cân nặng", icon: "tabler:scale" },
  { value: "gain",     label: "Tăng cân",         icon: "tabler:trending-up" },
];
const genderOptions = [
  { value: "male",   label: "Nam",  icon: "tabler:mars" },
  { value: "female", label: "Nữ",   icon: "tabler:venus" },
  { value: "other",  label: "Khác", icon: "tabler:gender-bigender" },
];
const activityOptions = [
  { value: "sedentary",   label: "Không tập luyện", icon: "tabler:sofa" },
  { value: "light",       label: "Chỉ đi bộ",       icon: "tabler:walk" },
  { value: "moderate",    label: "1–2 lần / tuần",  icon: "tabler:run" },
  { value: "active",      label: "3–5 lần / tuần",  icon: "tabler:barbell" },
  { value: "very_active", label: "Hằng ngày",        icon: "tabler:flame" },
];
const dietOptions = [
  { value: "standard",   label: "Thông thường", icon: "tabler:tools-kitchen-2" },
  { value: "vegetarian", label: "Chay",          icon: "tabler:leaf" },
  { value: "vegan",      label: "Thuần chay",    icon: "tabler:plant" },
];
const allergyOptions = [
  { value: "dairy",     label: "Sữa",           icon: "tabler:glass-full" },
  { value: "nuts",      label: "Hạt",            icon: "tabler:circle" },
  { value: "gluten",    label: "Gluten",         icon: "tabler:wheat" },
  { value: "soy",       label: "Đậu nành",      icon: "tabler:seeding" },
  { value: "eggs",      label: "Trứng",          icon: "tabler:egg" },
  { value: "shellfish", label: "Hải sản có vỏ", icon: "tabler:fish" },
];

const inputClass = "w-full rounded-xl border border-gray-600 bg-gray-900 px-5 py-3 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// ── Sub-components ────────────────────────────────────────

function VisualCard({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/10"
          : "border-gray-600 bg-gray-900 hover:border-gray-500"
      }`}
    >
      <span className={`w-14 h-14 rounded-xl flex items-center justify-center ${selected ? "bg-primary/20" : "bg-gray-700"}`}>
        <Icon icon={icon} width="28" height="28" className={selected ? "text-primary" : "text-gray-400"} />
      </span>
      <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-gray-300"}`}>{label}</span>
    </button>
  );
}

function OptionRow({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border-2 transition-all cursor-pointer mb-3 ${
        selected
          ? "border-primary bg-primary/10"
          : "border-gray-600 bg-gray-900 hover:border-gray-500"
      }`}
    >
      <span className={`text-base font-medium ${selected ? "text-primary" : "text-gray-300"}`}>{label}</span>
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary/20" : "bg-gray-700"}`}>
        <Icon icon={icon} width="20" height="20" className={selected ? "text-primary" : "text-gray-400"} />
      </span>
    </button>
  );
}

function NextButton({ onClick, disabled = false, label = "Tiếp theo" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-6 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────
const Onboarding = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: "", gender: "", height: "", weight: "",
    activityLevel: "", goal: "", dietType: "",
    allergies: [] as string[], name: "",
  });

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const pick = (field: string, value: string) => {
    setFormData(f => ({ ...f, [field]: value }));
    setTimeout(goNext, 200);
  };

  const toggleAllergy = (v: string) => {
    setFormData(f => ({
      ...f,
      allergies: f.allergies.includes(v) ? f.allergies.filter(a => a !== v) : [...f.allergies, v],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileAPI.create({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      });
      await preferencesAPI.create({ dietType: formData.dietType, allergies: formData.allergies });
      toast.success(`Chào mừng, ${formData.name}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thiết lập thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900"><Loader /></div>
  );

  const isNextDisabled =
    (step === 4 && !formData.age) ||
    (step === 5 && !formData.height) ||
    (step === 6 && !formData.weight) ||
    (step === 11 && !formData.name.trim());

  const showBack = step > 1 && ![3, 7, 12].includes(step);

  // BMI calculation for step 7
  const h = parseFloat(formData.height) / 100;
  const w = parseFloat(formData.weight);
  const bmi = h > 0 && w > 0 ? (w / (h * h)).toFixed(1) : null;
  const bmiNum = bmi ? parseFloat(bmi) : 0;
  const bmiLabel = bmiNum < 18.5 ? "Thiếu cân" : bmiNum < 25 ? "Bình thường" : bmiNum < 30 ? "Thừa cân" : "Béo phì";
  const bmiColor = bmiNum < 18.5 ? "#f4a261" : bmiNum < 25 ? "#2a9d8f" : bmiNum < 30 ? "#e9c46a" : "#e76f51";

  return (
    <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-6"><Logo /></div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{![3, 7, 12].includes(step) && `Bước ${step}/${TOTAL_STEPS}`}</span>
              <span></span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Goal */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Bạn muốn đạt điều gì?</h2>
              <div className="flex gap-3">
                {goalOptions.map(o => (
                  <VisualCard key={o.value} icon={o.icon} label={o.label} selected={formData.goal === o.value} onClick={() => pick("goal", o.value)} />
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Bạn là?</h2>
              <div className="flex gap-3">
                {genderOptions.map(o => (
                  <VisualCard key={o.value} icon={o.icon} label={o.label} selected={formData.gender === o.value} onClick={() => pick("gender", o.value)} />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Social proof break */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-5 py-2">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon icon="tabler:heart" width="40" height="40" className="text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">Sứ mệnh của Planeat</div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Chúng tôi tin rằng ăn uống lành mạnh không nên là điều xa xỉ. Planeat được tạo ra để giúp người Việt xây dựng thói quen ăn uống tốt hơn — mỗi ngày, mỗi bữa. Và bạn là một phần của điều đó.
              </p>
              <button onClick={goNext} className="w-full rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 mt-2">
                Tiếp tục
              </button>
            </div>
          )}

          {/* Step 4: Age */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bạn bao nhiêu tuổi?</h2>
              <p className="text-gray-400 text-sm mb-6"> </p>
              <input type="number" name="age" placeholder="25" value={formData.age}
                onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
                className={inputClass} />
              <NextButton onClick={goNext} disabled={isNextDisabled} />
            </div>
          )}

          {/* Step 5: Height */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Chiều cao của bạn?</h2>
              <div className="flex items-center gap-3">
                <input type="number" name="height" placeholder="165" value={formData.height}
                  onChange={e => setFormData(f => ({ ...f, height: e.target.value }))}
                  className={inputClass} />
                <span className="text-gray-400 font-semibold text-lg">cm</span>
              </div>
              <NextButton onClick={goNext} disabled={isNextDisabled} />
            </div>
          )}

          {/* Step 6: Weight */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Cân nặng hiện tại?</h2>
              <div className="flex items-center gap-3">
                <input type="number" name="weight" placeholder="60" value={formData.weight}
                  onChange={e => setFormData(f => ({ ...f, weight: e.target.value }))}
                  className={inputClass} />
                <span className="text-gray-400 font-semibold text-lg">kg</span>
              </div>
              <NextButton onClick={goNext} disabled={isNextDisabled} />
            </div>
          )}

          {/* Step 7: BMI break */}
          {step === 7 && (
            <div className="flex flex-col items-center gap-5 py-2">
              <Icon icon="tabler:heart-rate-monitor" width="48" height="48" className="text-primary" />
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Chỉ số BMI của bạn</p>
                {bmi ? (
                  <>
                    <div className="text-5xl font-bold text-white">{bmi}</div>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold" style={{ background: `${bmiColor}22`, color: bmiColor }}>
                      {bmiLabel}
                    </span>
                  </>
                ) : (
                  <div className="text-gray-500">Không đủ dữ liệu</div>
                )}
              </div>
              {bmi && (
                <div className="w-full bg-gray-700 rounded-xl p-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Gầy</span><span>BT</span><span>Thừa</span><span>Béo phì</span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(90deg, #74c0e8, #2a9d8f, #e9c46a, #e76f51)" }}>
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow" style={{ left: `${Math.min(Math.max(((bmiNum - 10) / 30) * 100, 0), 100)}%`, transform: "translate(-50%, -50%)", borderColor: bmiColor }} />
                  </div>
                </div>
              )}
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                Planeat sẽ điều chỉnh thực đơn để giúp bạn đạt mục tiêu một cách lành mạnh.
              </p>
              <button onClick={goNext} className="w-full rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90">
                Tiếp tục
              </button>
            </div>
          )}

          {/* Step 8: Activity */}
          {step === 8 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bạn có hay vận động không?</h2>
              <p className="text-gray-400 text-sm mb-6">Dù ít hay nhiều, chúng tôi đều có thể giúp bạn ăn uống phù hợp hơn</p>
              {activityOptions.map(o => (
                <OptionRow key={o.value} icon={o.icon} label={o.label} selected={formData.activityLevel === o.value} onClick={() => pick("activityLevel", o.value)} />
              ))}
            </div>
          )}

          {/* Step 9: Diet */}
          {step === 9 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bạn ăn theo chế độ nào?</h2>
              <p className="text-gray-400 text-sm mb-6">Thực đơn sẽ chỉ gợi ý những món phù hợp với bạn</p>
              {dietOptions.map(o => (
                <OptionRow key={o.value} icon={o.icon} label={o.label} selected={formData.dietType === o.value} onClick={() => pick("dietType", o.value)} />
              ))}
            </div>
          )}

          {/* Step 10: Allergies */}
          {step === 10 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bạn có dị ứng thực phẩm không?</h2>
              <p className="text-gray-400 text-sm mb-6">Chọn tất cả những gì áp dụng</p>
              <div className="grid grid-cols-2 gap-3 mb-2">
                {allergyOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => toggleAllergy(o.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      formData.allergies.includes(o.value)
                        ? "border-primary bg-primary/10"
                        : "border-gray-600 bg-gray-900 hover:border-gray-500"
                    }`}
                  >
                    <Icon icon={o.icon} width="18" height="18" className={formData.allergies.includes(o.value) ? "text-primary" : "text-gray-400"} />
                    <span className={`text-sm font-medium ${formData.allergies.includes(o.value) ? "text-primary" : "text-gray-300"}`}>{o.label}</span>
                  </button>
                ))}
              </div>
              <NextButton onClick={goNext} />
            </div>
          )}

          {/* Step 11: Name */}
          {step === 11 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Chúng tôi nên gọi bạn là gì?</h2>
              <input type="text" name="name" placeholder="Tên của bạn" value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter" && formData.name.trim()) goNext(); }}
                className="w-full rounded-xl border border-gray-600 bg-gray-900 px-5 py-3 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-primary" />
              <NextButton onClick={goNext} disabled={isNextDisabled} />
            </div>
          )}

          {/* Step 12: Results */}
          {step === 12 && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Icon icon="tabler:check" width="32" height="32" className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white">Thực đơn của {formData.name || "bạn"} đã sẵn sàng!</h2>
                <p className="text-gray-400 text-sm mt-1">Đây là tóm tắt hồ sơ của bạn</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "tabler:target", label: "Mục tiêu", value: goalOptions.find(g => g.value === formData.goal)?.label },
                  { icon: "tabler:activity", label: "Vận động", value: activityOptions.find(a => a.value === formData.activityLevel)?.label },
                  { icon: "tabler:leaf", label: "Chế độ ăn", value: dietOptions.find(d => d.value === formData.dietType)?.label },
                  { icon: "tabler:heart-rate-monitor", label: "BMI", value: bmi ?? "—" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon={item.icon} width="14" height="14" className="text-primary" />
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                {[
                  { label: "Chiều cao", value: `${formData.height} cm` },
                  { label: "Cân nặng", value: `${formData.weight} kg` },
                  { label: "Tuổi", value: formData.age },
                ].map(item => (
                  <div key={item.label} className="flex-1 bg-gray-900 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader /> : <><span>Bắt đầu ngay</span><Icon icon="tabler:arrow-right" width="20" height="20" /></>}
              </button>
            </div>
          )}

          {/* Back button */}
          {showBack && (
            <button
              onClick={goBack}
              className="mt-4 w-full rounded-xl border border-gray-600 bg-transparent px-5 py-3 text-base font-medium text-gray-400 transition hover:bg-gray-700"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Onboarding;