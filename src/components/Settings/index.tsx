"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { profileAPI, preferencesAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activityLevel: "sedentary",
    goal: "maintain",
  });

  const [preferencesData, setPreferencesData] = useState({
    dietType: "standard",
    allergies: [] as string[],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profileRes = await profileAPI.get().catch(() => null);
      const preferencesRes = await preferencesAPI.get().catch(() => null);

      if (profileRes?.data) {
        setProfileData({
          age: profileRes.data.age.toString(),
          gender: profileRes.data.gender,
          height: profileRes.data.height.toString(),
          weight: profileRes.data.weight.toString(),
          activityLevel: profileRes.data.activityLevel,
          goal: profileRes.data.goal,
        });
      }

      if (preferencesRes?.data) {
        setPreferencesData({
          dietType: preferencesRes.data.dietType,
          allergies: preferencesRes.data.allergies || [],
        });
      }
    } catch (error: any) {
      toast.error("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePreferencesChange = (e: any) => {
    const { name, value } = e.target;
    setPreferencesData({ ...preferencesData, [name]: value });
  };

  const handleAllergyToggle = (allergy: string) => {
    const newAllergies = preferencesData.allergies.includes(allergy)
      ? preferencesData.allergies.filter((a) => a !== allergy)
      : [...preferencesData.allergies, allergy];
    setPreferencesData({ ...preferencesData, allergies: newAllergies });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profilePayload = {
        age: parseInt(profileData.age),
        gender: profileData.gender,
        height: parseInt(profileData.height),
        weight: parseInt(profileData.weight),
        activityLevel: profileData.activityLevel,
        goal: profileData.goal,
      };

      const preferencesPayload = {
        dietType: preferencesData.dietType,
        allergies: preferencesData.allergies,
      };

      // Try update first, create if doesn't exist
      await profileAPI.update(profilePayload).catch(() => profileAPI.create(profilePayload));
      await preferencesAPI.update(preferencesPayload).catch(() => preferencesAPI.create(preferencesPayload));

      toast.success("Đã cập nhật cài đặt thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Không thể cập nhật cài đặt");
    } finally {
      setSaving(false);
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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900 lg:py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="relative mx-auto max-w-[700px] overflow-hidden rounded-lg bg-white px-8 py-14 shadow-lg dark:bg-gray-800 sm:px-12 md:px-[60px]">
              <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">
                Cài đặt
              </h2>

              <form onSubmit={handleSave}>
                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Thông tin cá nhân
                  </h3>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="age"
                      placeholder="Tuổi"
                      value={profileData.age}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-3 text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 placeholder:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-[13px] text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="male" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Nam</option>
                      <option value="female" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Nữ</option>
                      <option value="other" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Khác</option>
                    </select>
                  </div>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="height"
                      placeholder="Chiều cao (cm)"
                      value={profileData.height}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-3 text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 placeholder:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <input
                      type="number"
                      name="weight"
                      placeholder="Cân nặng (kg)"
                      value={profileData.weight}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-3 text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 placeholder:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="activityLevel"
                      value={profileData.activityLevel}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-[13px] text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="sedentary" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Ít vận động</option>
                      <option value="light" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Vận động nhẹ</option>
                      <option value="moderate" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Vận động trung bình</option>
                      <option value="active" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Vận động nhiều</option>
                      <option value="very_active" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Vận động rất nhiều</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="goal"
                      value={profileData.goal}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-[13px] text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="lose" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Giảm cân</option>
                      <option value="maintain" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Duy trì cân nặng</option>
                      <option value="gain" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Tăng cân</option>
                    </select>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Sở thích ăn uống
                  </h3>

                  <div className="mb-[22px]">
                    <select
                      name="dietType"
                      value={preferencesData.dietType}
                      onChange={handlePreferencesChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-5 py-[13px] text-base text-gray-900 outline-none transition focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="standard" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Thông thường</option>
                      <option value="vegetarian" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Chay</option>
                      <option value="vegan" className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">Thuần chay</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <label className="mb-3 block text-base font-medium text-gray-900 dark:text-white">
                      Dị ứng
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allergyOptions.map((allergy) => (
                        <label key={allergy.value} className="flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={preferencesData.allergies.includes(allergy.value)}
                            onChange={() => handleAllergyToggle(allergy.value)}
                            className="mr-2 h-5 w-5 cursor-pointer rounded border-gray-300 accent-primary dark:border-gray-600"
                          />
                          <span className="text-base text-gray-900 dark:text-white">
                            {allergy.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-900 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-md bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader /> : "Lưu thay đổi"}
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

export default Settings;