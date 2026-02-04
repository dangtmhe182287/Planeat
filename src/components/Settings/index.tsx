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
    mealsPerDay: 3,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [profileRes, preferencesRes] = await Promise.all([
        profileAPI.get(),
        preferencesAPI.get(),
      ]);

      setProfileData({
        age: profileRes.data.age.toString(),
        gender: profileRes.data.gender,
        height: profileRes.data.height.toString(),
        weight: profileRes.data.weight.toString(),
        activityLevel: profileRes.data.activityLevel,
        goal: profileRes.data.goal,
      });

      setPreferencesData({
        dietType: preferencesRes.data.dietType,
        allergies: preferencesRes.data.allergies || [],
        mealsPerDay: preferencesRes.data.mealsPerDay,
      });
    } catch (error: any) {
      toast.error("Failed to load settings");
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
        mealsPerDay: preferencesData.mealsPerDay,
      };

      await Promise.all([
        profileAPI.update(profilePayload),
        preferencesAPI.update(preferencesPayload),
      ]);

      toast.success("Settings updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const allergyOptions = ["dairy", "nuts", "gluten", "soy", "eggs", "shellfish"];

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="relative mx-auto max-w-[700px] overflow-hidden rounded-lg bg-white px-8 py-14 dark:bg-dark-2 sm:px-12 md:px-[60px]">
              <h2 className="mb-10 text-center text-3xl font-bold text-dark dark:text-white">
                Settings
              </h2>

              <form onSubmit={handleSave}>
                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
                    Personal Information
                  </h3>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={profileData.age}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none transition dark:border-dark-3 dark:text-white"
                    />
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="height"
                      placeholder="Height (cm)"
                      value={profileData.height}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    />
                    <input
                      type="number"
                      name="weight"
                      placeholder="Weight (kg)"
                      value={profileData.weight}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    />
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="activityLevel"
                      value={profileData.activityLevel}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="goal"
                      value={profileData.goal}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    >
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Weight</option>
                    </select>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
                    Dietary Preferences
                  </h3>

                  <div className="mb-[22px]">
                    <select
                      name="dietType"
                      value={preferencesData.dietType}
                      onChange={handlePreferencesChange}
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto</option>
                      <option value="paleo">Paleo</option>
                    </select>
                  </div>

                  <div className="mb-[22px]">
                    <label className="mb-3 block text-base text-dark dark:text-white">
                      Allergies
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allergyOptions.map((allergy) => (
                        <label key={allergy} className="flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={preferencesData.allergies.includes(allergy)}
                            onChange={() => handleAllergyToggle(allergy)}
                            className="mr-2 h-5 w-5 cursor-pointer rounded border-dark_border accent-primary"
                          />
                          <span className="text-base capitalize text-dark dark:text-white">
                            {allergy}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[22px]">
                    <select
                      name="mealsPerDay"
                      value={preferencesData.mealsPerDay}
                      onChange={handlePreferencesChange}
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base outline-none dark:border-dark-3 dark:text-white"
                    >
                      <option value={3}>3 Meals Per Day</option>
                      <option value={4}>4 Meals Per Day</option>
                      <option value={5}>5 Meals Per Day</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 rounded-md border border-dark_border px-5 py-3 text-base font-medium transition hover:bg-dark_border/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-md bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader /> : "Save Changes"}
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