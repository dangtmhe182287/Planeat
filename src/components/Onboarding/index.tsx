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

      toast.success("Profile created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Setup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const allergyOptions = ["dairy", "nuts", "gluten", "soy", "eggs", "shellfish"];

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="relative mx-auto max-w-[700px] overflow-hidden rounded-lg bg-white px-8 py-14 dark:bg-dark-2 sm:px-12 md:px-[60px]">
              <div className="mb-10 text-center">
                <Logo />
                <h2 className="mt-6 text-3xl font-bold text-dark dark:text-white">
                  Complete Your Profile
                </h2>
                <p className="mt-2 text-base text-body-color dark:text-dark-6">
                  Help us personalize your meal plans
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
                    Personal Information
                  </h3>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="age"
                        placeholder="Age"
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
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-[22px] grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="height"
                        placeholder="Height (cm)"
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
                        placeholder="Weight (kg)"
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
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very_active">Very Active (athlete)</option>
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
                      value={formData.dietType}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
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
                      Allergies (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allergyOptions.map((allergy) => (
                        <label
                          key={allergy}
                          className="flex cursor-pointer items-center"
                        >
                          <input
                            type="checkbox"
                            checked={formData.allergies.includes(allergy)}
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
                      value={formData.mealsPerDay}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-dark_border border-opacity-60 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
                    >
                      <option value={3}>3 Meals Per Day</option>
                      <option value={4}>4 Meals Per Day</option>
                      <option value={5}>5 Meals Per Day</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-90 disabled:opacity-50"
                  >
                    Complete Setup {loading && <Loader />}
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