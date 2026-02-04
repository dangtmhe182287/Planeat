"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { mealsAPI, mealPlanAPI } from "@/utils/api";
import Loader from "@/components/Common/Loader";

interface SwapMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMeal: any;
  slot: "breakfast" | "lunch" | "dinner";
  date: string;
  onSwapSuccess: () => void;
}

const SwapMealModal = ({
  isOpen,
  onClose,
  currentMeal,
  slot,
  date,
  onSwapSuccess,
}: SwapMealModalProps) => {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMealOptions();
    }
  }, [isOpen, slot]);

  const loadMealOptions = async () => {
    setLoading(true);
    try {
      const response = await mealsAPI.getAll({ mealType: slot });
      // Filter out current meal
      const filteredMeals = response.data.filter(
        (m: any) => m._id !== currentMeal?._id
      );
      setMeals(filteredMeals);
    } catch (error) {
      toast.error("Failed to load meal options");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (newMealId: string) => {
    setSwapping(true);
    try {
      await mealPlanAPI.swap({ date, slot, mealId: newMealId });
      toast.success("Meal swapped successfully!");
      onSwapSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to swap meal");
    } finally {
      setSwapping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl bg-white dark:bg-dark-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark_border p-6">
          <h3 className="text-2xl font-semibold text-dark dark:text-white">
            Swap {slot.charAt(0).toUpperCase() + slot.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-dark hover:text-primary dark:text-white"
          >
            <Icon icon="tabler:x" width="24" height="24" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 100px)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : meals.length === 0 ? (
            <p className="text-center text-black/50 dark:text-white/50">
              No alternative meals available
            </p>
          ) : (
            <div className="grid gap-4">
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="flex items-center gap-4 rounded-xl border border-dark_border p-4 transition hover:border-primary"
                >
                  {meal.imageUrl && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-dark dark:text-white">
                      {meal.name}
                    </h4>
                    <div className="mt-1 flex gap-4 text-sm text-black/50 dark:text-white/50">
                      <span>🔥 {meal.calories || 0} cal</span>
                      <span>🥩 {meal.protein || 0}g protein</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSwap(meal._id)}
                    disabled={swapping}
                    className="rounded-full bg-primary px-6 py-2 text-white transition hover:bg-primary/80 disabled:opacity-50"
                  >
                    {swapping ? <Loader /> : "Swap"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapMealModal;