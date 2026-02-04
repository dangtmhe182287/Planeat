"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { profileAPI, mealPlanAPI } from "@/utils/api";
import { Icon } from "@iconify/react";
import Loader from "@/components/Common/Loader";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const profileRes = await profileAPI.get();
      setProfile(profileRes.data);

      try {
        const planRes = await mealPlanAPI.get(todayDate);
        console.log('Meal plan data:', planRes.data);
        setMealPlan(planRes.data);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading meal plan:', error);
        }
        setMealPlan(null);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tải dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      if (mealPlan) {
        try {
          await mealPlanAPI.delete(todayDate);
          console.log('Deleted existing meal plan');
        } catch (deleteError: any) {
          console.error('Error deleting existing plan:', deleteError);
        }
      }

      const response = await mealPlanAPI.generate({ date: todayDate });
      console.log('Generated plan:', response.data);
      setMealPlan(response.data.plan);
      toast.success("Đã tạo thực đơn thành công!");
    } catch (error: any) {
      console.error('Generate error:', error);
      const message = error.response?.data?.message || "Không thể tạo thực đơn";
      
      if (error.response?.status === 403 && message.includes('already exists')) {
        try {
          await mealPlanAPI.delete(todayDate);
          const response = await mealPlanAPI.generate({ date: todayDate });
          setMealPlan(response.data.plan);
          toast.success("Đã tạo lại thực đơn thành công!");
          return;
        } catch (retryError: any) {
          toast.error("Không thể tạo lại thực đơn");
        }
      } else {
        toast.error(message);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-900 py-20 min-h-screen">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
            Chào mừng đến Planeat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Lập kế hoạch bữa ăn cá nhân của bạn
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.targetCalories || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Calo mục tiêu</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.targetProtein || 0}g</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Protein</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.targetCarbs || 0}g</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Carbs</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.targetFat || 0}g</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Chất béo</p>
            </div>
          </div>
        </div>

        {/* Today's Meal Plan */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <p className="text-primary text-sm font-semibold mb-2 tracking-widest uppercase">
                KẾ HOẠCH HÔM NAY
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Bữa ăn của bạn hôm nay
              </h2>
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="text-base font-semibold rounded-xl text-white py-3 px-6 bg-primary hover:bg-primary/90 border border-primary disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              {generating ? <Loader /> : <Icon icon="tabler:refresh" width="20" height="20" />}
              {mealPlan ? 'Tạo lại' : 'Tạo kế hoạch'}
            </button>
          </div>

          {!mealPlan ? (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <Icon icon="tabler:chef-hat" width="64" height="64" className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Chưa có kế hoạch bữa ăn
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Nhấn "Tạo kế hoạch" để tạo kế hoạch bữa ăn cá nhân của bạn cho hôm nay
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <MealCard
                meal={mealPlan.breakfast}
                type="Bữa sáng"
                icon="tabler:sun"
              />
              
              <MealCard
                meal={mealPlan.lunch}
                type="Bữa trưa"
                icon="tabler:sun-high"
              />
              
              <MealCard
                meal={mealPlan.dinner}
                type="Bữa tối"
                icon="tabler:moon"
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <Icon icon="tabler:settings" width="40" height="40" className="text-primary mb-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Cài đặt
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Cập nhật hồ sơ và sở thích của bạn
            </p>
            <button 
              onClick={() => router.push("/settings")}
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 text-sm"
            >
              Đi tới Cài đặt
              <Icon icon="tabler:arrow-right" width="18" height="18" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <Icon icon="tabler:credit-card" width="40" height="40" className="text-primary mb-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Đăng ký
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Quản lý đăng ký và thanh toán của bạn
            </p>
            <button 
              onClick={() => router.push("/subscription")}
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 text-sm"
            >
              Xem đăng ký
              <Icon icon="tabler:arrow-right" width="18" height="18" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to calculate nutrition from ingredients
const calculateNutrition = (meal: any) => {
  if (!meal?.ingredients || meal.ingredients.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  let calories = 0, protein = 0, carbs = 0, fat = 0;

  meal.ingredients.forEach((ing: any) => {
    if (ing.ingredientId) {
      const amount = ing.amount || 0;
      calories += (ing.ingredientId.caloriesPer100g || 0) * amount / 100;
      protein += (ing.ingredientId.proteinPer100g || 0) * amount / 100;
      carbs += (ing.ingredientId.carbsPer100g || 0) * amount / 100;
      fat += (ing.ingredientId.fatPer100g || 0) * amount / 100;
    }
  });

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

// Meal Card Component
const MealCard = ({ meal, type, icon }: { meal: any; type: string; icon: string }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!meal) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Icon icon={icon} width="28" height="28" className="text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{type}</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có bữa ăn</p>
      </div>
    );
  }

  const nutrition = calculateNutrition(meal);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      {meal.imageUrl && (
        <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-700">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon={icon} width="20" height="20" className="text-primary" />
          <span className="text-xs text-primary font-bold uppercase tracking-wider">
            {type}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {meal.name}
        </h3>
        
        {/* Nutrition Summary */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Calo</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{nutrition.calories}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{nutrition.protein}g</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{nutrition.carbs}g</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Chất béo</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{nutrition.fat}g</p>
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium flex items-center justify-center gap-2"
        >
          {showDetails ? 'Ẩn' : 'Hiện'} chi tiết
          <Icon icon={showDetails ? "tabler:chevron-up" : "tabler:chevron-down"} width="16" height="16" />
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Nguyên liệu</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {meal.ingredients.map((ing: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        {ing.ingredientId?.name || 'Không rõ'} - {ing.amount}g
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meal.instructions && meal.instructions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Hướng dẫn</p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  {meal.instructions.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {meal.dietTypes && meal.dietTypes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Loại chế độ ăn</p>
                <div className="flex flex-wrap gap-2">
                  {meal.dietTypes.map((diet: string, idx: number) => (
                    <span key={idx} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;