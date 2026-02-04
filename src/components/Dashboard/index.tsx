// src/components/Dashboard/index.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { profileAPI, mealPlanAPI, mealsAPI } from "@/utils/api";
import { Icon } from "@iconify/react";
import Loader from "@/components/Common/Loader";
import { useAuth } from "@/hooks/useAuth";
import SwapMealModal from "./SwapMealModal";

const Dashboard = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [swapModal, setSwapModal] = useState<{
    isOpen: boolean;
    meal: any;
    slot: "breakfast" | "lunch" | "dinner";
  }>({
    isOpen: false,
    meal: null,
    slot: "breakfast",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load profile
      const profileRes = await profileAPI.get();
      setProfile(profileRes.data);

      // Try to load today's meal plan
      try {
        const planRes = await mealPlanAPI.get(todayDate);
        setMealPlan(planRes.data);
      } catch (error: any) {
        // No meal plan for today - that's okay
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to load dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const response = await mealPlanAPI.generate({ date: todayDate });
      setMealPlan(response.data.plan);
      toast.success("Meal plan generated!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to generate plan";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenSwapModal = (meal: any, slot: "breakfast" | "lunch" | "dinner") => {
    setSwapModal({ isOpen: true, meal, slot });
  };

  const handleCloseSwapModal = () => {
    setSwapModal({ isOpen: false, meal: null, slot: "breakfast" });
  };

  const handleSwapSuccess = () => {
    loadDashboardData();
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-700 py-20">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-semibold mb-5 text-black dark:text-white">
            Welcome to Planeat
          </h1>
          <p className="text-black/55 dark:text-white/50 lg:text-lg font-normal mb-10">
            Your personalized meal planning dashboard
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-2 rounded-3xl p-6 text-center">
              <p className="text-3xl font-bold text-primary">{profile?.targetCalories || 0}</p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-2">Target Calories</p>
            </div>
            <div className="bg-white dark:bg-dark-2 rounded-3xl p-6 text-center">
              <p className="text-3xl font-bold text-primary">{profile?.targetProtein || 0}g</p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-2">Protein</p>
            </div>
            <div className="bg-white dark:bg-dark-2 rounded-3xl p-6 text-center">
              <p className="text-3xl font-bold text-primary">{profile?.targetCarbs || 0}g</p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-2">Carbs</p>
            </div>
            <div className="bg-white dark:bg-dark-2 rounded-3xl p-6 text-center">
              <p className="text-3xl font-bold text-primary">{profile?.targetFat || 0}g</p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-2">Fat</p>
            </div>
          </div>
        </div>

        {/* Today's Meal Plan */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-primary text-lg font-normal mb-2 tracking-widest uppercase">
                TODAY'S PLAN
              </p>
              <h2 className="text-3xl lg:text-5xl font-semibold text-black dark:text-white">
                Your meals for today
              </h2>
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="text-xl font-medium rounded-full text-white py-4 px-8 bg-primary hover:bg-primary/80 border border-primary disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? <Loader /> : <Icon icon="tabler:refresh" width="24" height="24" />}
              {mealPlan ? 'Regenerate' : 'Generate Plan'}
            </button>
          </div>

          {!mealPlan ? (
            <div className="bg-white dark:bg-dark-2 rounded-3xl p-16 text-center">
              <Icon icon="tabler:chef-hat" width="80" height="80" className="mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                No meal plan yet
              </h3>
              <p className="text-black/50 dark:text-white/50 mb-8">
                Click "Generate Plan" to create your personalized meal plan for today
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breakfast Card */}
              <MealCard
                meal={mealPlan.breakfast}
                type="Breakfast"
                icon="tabler:sun"
                onSwap={() => handleOpenSwapModal(mealPlan.breakfast, "breakfast")}
              />
              
              {/* Lunch Card */}
              <MealCard
                meal={mealPlan.lunch}
                type="Lunch"
                icon="tabler:sun-high"
                onSwap={() => handleOpenSwapModal(mealPlan.lunch, "lunch")}
              />
              
              {/* Dinner Card */}
              <MealCard
                meal={mealPlan.dinner}
                type="Dinner"
                icon="tabler:moon"
                onSwap={() => handleOpenSwapModal(mealPlan.dinner, "dinner")}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8">
            <Icon icon="tabler:settings" width="48" height="48" className="text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Profile Settings
            </h3>
            <p className="text-black/50 dark:text-white/50 mb-4">
              Update your profile and dietary preferences
            </p>
            <button 
              onClick={() => router.push("/settings")}
              className="text-primary hover:underline flex items-center gap-2"
            >
              Go to Settings
              <Icon icon="tabler:arrow-right" width="20" height="20" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8">
            <Icon icon="tabler:history" width="48" height="48" className="text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Subscription
            </h3>
            <p className="text-black/50 dark:text-white/50 mb-4">
              Manage your subscription and billing
            </p>
            <button 
              onClick={() => router.push("/subscription")}
              className="text-primary hover:underline flex items-center gap-2"
            >
              View Subscription
              <Icon icon="tabler:arrow-right" width="20" height="20" />
            </button>
          </div>
        </div>
      </div>

      {/* Swap Meal Modal */}
      <SwapMealModal
        isOpen={swapModal.isOpen}
        onClose={handleCloseSwapModal}
        currentMeal={swapModal.meal}
        slot={swapModal.slot}
        date={todayDate}
        onSwapSuccess={handleSwapSuccess}
      />
    </section>
  );
};

// Meal Card Component
const MealCard = ({ meal, type, icon, onSwap }: { meal: any; type: string; icon: string; onSwap: () => void }) => {
  if (!meal) {
    return (
      <div className="bg-white dark:bg-dark-2 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={icon} width="32" height="32" className="text-primary" />
          <h3 className="text-xl font-semibold text-black dark:text-white">{type}</h3>
        </div>
        <p className="text-black/50 dark:text-white/50">No meal assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-2 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
      {meal.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon icon={icon} width="24" height="24" className="text-primary" />
          <span className="text-sm text-primary font-semibold uppercase tracking-wider">
            {type}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {meal.name}
        </h3>
        <div className="flex gap-4 text-sm text-black/50 dark:text-white/50 mb-4">
          <span>🔥 {meal.calories || 0} cal</span>
          <span>🥩 {meal.protein || 0}g</span>
        </div>
        <button
          onClick={onSwap}
          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
        >
          <Icon icon="tabler:exchange" width="16" height="16" />
          Swap Meal
        </button>
      </div>
    </div>
  );
};

export default Dashboard;