"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";
import { profileAPI, preferencesAPI } from "@/utils/api";

const Onboarding = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Combined form data
  const [formData, setFormData] = useState({
    // Profile fields
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activityLevel: "sedentary",
    goal: "maintain",
    // Preferences fields
    dietType: "standard",
    allergies: [] as string[],
    mealsPerDay: 3,
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create profile
      const profilePayload = {
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      };

      await profileAPI.create(profilePayload);

      // Create preferences
      const preferencesPayload = {
        dietType: formData.dietType,
        allergies: formData.allergies,
        mealsPerDay: formData.mealsPerDay,
      };

      await preferencesAPI.create(preferencesPayload);

      toast.success("Đã tạo hồ sơ thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Thiết lập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const allergyOptions = [
    { value: "dairy", label: "Sữa" },
    { value: "nuts", label: "Hạt" },
    { value: "gluten", label: "Gluten" },
    { value: "soy", label: "Đậu nành" },
    { value: "eggs", label: "Trứng" },
    { value: "shellfish", label: "Hải sản có vỏ" }
  ];

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="relative mx-auto max-w-[700px] overflow-hidden rounded-lg bg-white px-8 py-14 dark:bg-dark-2 sm:px-12 md:px-[60px]">
              <div className="mb-10 text-center">
                <Logo />
                <h2 className="mt-6 text-3xl font-bold text-dark dark:text-white">
                  Hoàn thiện hồ sơ của bạn
                </h2>
                <p className="mt-2 text-base text-body-color dark:text-dark-6">
                  Giúp chúng tôi cá nhân hóa kế hoạch bữa ăn của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
                    Thông tin cá nhân
                  </h3>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="age"
                        placeholder="Tuổi"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary dark:border-dark-3 dark:text-white"
                      />
                    </div>
                    <div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="height"
                        placeholder="Chiều cao (cm)"
                        value={formData.height}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary dark:border-dark-3 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="weight"
                        placeholder="Cân nặng (kg)"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary dark:border-dark-3 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                    >
                      <option value="sedentary">Ít vận động (không/ít tập luyện)</option>
                      <option value="light">Vận động nhẹ (1-3 ngày/tuần)</option>
                      <option value="moderate">Vận động trung bình (3-5 ngày/tuần)</option>
                      <option value="active">Vận động nhiều (6-7 ngày/tuần)</option>
                      <option value="very_active">Vận động rất nhiều (vận động viên)</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                    >
                      <option value="lose">Giảm cân</option>
                      <option value="maintain">Duy trì cân nặng</option>
                      <option value="gain">Tăng cân</option>
                    </select>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
                    Sở thích ăn uống
                  </h3>

                  <div className="mb-[22px]">
                    <select
                      name="dietType"
                      value={formData.dietType}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                    >
                      <option value="standard">Thông thường</option>
                      <option value="vegetarian">Chay (Vegetarian)</option>
                      <option value="vegan">Thuần chay (Vegan)</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <label className="mb-3 block text-base text-dark dark:text-white">
                      Dị ứng (chọn tất cả nếu có)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allergyOptions.map((allergy) => (
                        <label
                          key={allergy.value}
                          className="flex cursor-pointer items-center"
                        >
                          <input
                            type="checkbox"
                            checked={formData.allergies.includes(allergy.value)}
                            onChange={() => handleAllergyToggle(allergy.value)}
                            className="mr-2 h-5 w-5 cursor-pointer rounded border-dark_border accent-primary"
                          />
                          <span className="text-base text-dark dark:text-white">
                            {allergy.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="mealsPerDay"
                      value={formData.mealsPerDay}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                    >
                      <option value={3}>3 bữa mỗi ngày</option>
                      <option value={4}>4 bữa mỗi ngày</option>
                      <option value={5}>5 bữa mỗi ngày</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-90 disabled:opacity-50"
                  >
                    Hoàn tất thiết lập {loading && <Loader />}
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

export default Onboarding;