// Onboarding component
// Multi-step onboarding flow for new users after signup
// Steps: age/gender -> height/weight -> activity level -> goal -> diet/allergies -> name
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { profileAPI, preferencesAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const TOTAL_STEPS = 6;

const allergyOptions = [
  { value: "dairy", label: "Sữa" },
  { value: "nuts", label: "Hạt" },
  { value: "gluten", label: "Gluten" },
  { value: "soy", label: "Đậu nành" },
  { value: "eggs", label: "Trứng" },
  { value: "shellfish", label: "Hải sản có vỏ" },
];

const Onboarding = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activityLevel: "sedentary",
    goal: "maintain",
    dietType: "standard",
    allergies: [] as string[],
    name: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAllergyToggle = (allergy: string) => {
    const newAllergies = formData.allergies.includes(allergy)
      ? formData.allergies.filter((a) => a !== allergy)
      : [...formData.allergies, allergy];
    setFormData({ ...formData, allergies: newAllergies });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

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

      await preferencesAPI.create({
        dietType: formData.dietType,
        allergies: formData.allergies,
      });

      toast.success(`Chào mừng, ${formData.name}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thiết lập thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-600 bg-gray-900 px-5 py-3 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-primary";
  const selectClass = "w-full rounded-xl border border-gray-600 bg-gray-900 px-5 py-3 text-base text-white outline-none transition focus:border-primary";

  return (
    <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Bước {step}/{TOTAL_STEPS}</span>
              <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Tuổi + Giới tính */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Thông tin cơ bản</h2>
              <p className="text-gray-400 text-sm mb-6">Cho chúng tôi biết một chút về bạn</p>
              <div className="space-y-4">
                <input
                  type="number"
                  name="age"
                  placeholder="Tuổi"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={inputClass + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={selectClass}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Chiều cao + Cân nặng */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Vóc dáng</h2>
              <p className="text-gray-400 text-sm mb-6">Giúp chúng tôi tính toán chính xác hơn</p>
              <div className="space-y-4">
                <input
                  type="number"
                  name="height"
                  placeholder="Chiều cao (cm)"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={inputClass + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Cân nặng (kg)"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={inputClass + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                />
              </div>
            </div>
          )}

          {/* Step 3: Mức độ vận động */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Mức độ vận động</h2>
              <p className="text-gray-400 text-sm mb-6">Bạn thường vận động như thế nào?</p>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleInputChange} className={selectClass}>
                <option value="sedentary">Ít vận động (không/ít tập luyện)</option>
                <option value="light">Vận động nhẹ (1-3 ngày/tuần)</option>
                <option value="moderate">Vận động trung bình (3-5 ngày/tuần)</option>
                <option value="active">Vận động nhiều (6-7 ngày/tuần)</option>
                <option value="very_active">Vận động rất nhiều (vận động viên)</option>
              </select>
            </div>
          )}

          {/* Step 4: Mục tiêu */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Mục tiêu của bạn</h2>
              <p className="text-gray-400 text-sm mb-6">Bạn muốn đạt được điều gì?</p>
              <select name="goal" value={formData.goal} onChange={handleInputChange} className={selectClass}>
                <option value="lose">Giảm cân</option>
                <option value="maintain">Duy trì cân nặng</option>
                <option value="gain">Tăng cân</option>
              </select>
            </div>
          )}

          {/* Step 5: Chế độ ăn + Dị ứng */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Chế độ ăn uống</h2>
              <p className="text-gray-400 text-sm mb-6">Để chúng tôi gợi ý phù hợp hơn</p>
              <div className="space-y-4">
                <select name="dietType" value={formData.dietType} onChange={handleInputChange} className={selectClass}>
                  <option value="standard">Thông thường</option>
                  <option value="vegetarian">Chay (Vegetarian)</option>
                  <option value="vegan">Thuần chay (Vegan)</option>
                </select>
                <div>
                  <p className="text-gray-400 text-sm mb-3">Dị ứng (chọn tất cả nếu có)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {allergyOptions.map((allergy) => (
                      <label key={allergy.value} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.allergies.includes(allergy.value)}
                          onChange={() => handleAllergyToggle(allergy.value)}
                          className="h-5 w-5 cursor-pointer rounded border-gray-600 accent-primary"
                        />
                        <span className="text-white text-sm">{allergy.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Tên */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Chúng tôi nên gọi bạn là gì?</h2>
              <p className="text-gray-400 text-sm mb-6">Tên hoặc biệt danh của bạn</p>
              <input
                type="text"
                name="name"
                placeholder="Tên của bạn"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-xl border border-gray-600 bg-transparent px-5 py-3 text-base font-medium text-white transition hover:bg-gray-700"
              >
                Quay lại
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.age || !formData.gender)) ||
                  (step === 2 && (!formData.height || !formData.weight))
                }
                className="flex-1 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                className="flex-1 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader /> : null}
                Hoàn tất
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Onboarding;