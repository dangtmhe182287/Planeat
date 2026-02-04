"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { subscriptionAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const Subscription = () => {
  const { loading: authLoading } = useAuth(true);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getStatus();
      setSubscription(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No subscription found - that's okay
        setSubscription(null);
      } else {
        toast.error("Failed to load subscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setCancelling(true);
    try {
      await subscriptionAPI.cancel();
      toast.success("Subscription cancelled");
      loadSubscription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trial";

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="relative mx-auto max-w-[700px] overflow-hidden rounded-lg bg-white px-8 py-14 dark:bg-dark-2 sm:px-12 md:px-[60px]">
              <h2 className="mb-10 text-center text-3xl font-bold text-dark dark:text-white">
                Subscription
              </h2>

              {!subscription ? (
                <div className="text-center">
                  <Icon
                    icon="tabler:crown"
                    width="80"
                    height="80"
                    className="mx-auto mb-6 text-primary"
                  />
                  <h3 className="mb-4 text-2xl font-semibold text-dark dark:text-white">
                    No Active Subscription
                  </h3>
                  <p className="mb-8 text-black/50 dark:text-white/50">
                    Subscribe to unlock premium features and unlimited meal plans
                  </p>

                  {/* Pricing */}
                  <div className="mb-8 rounded-3xl border-2 border-primary bg-primary/5 p-8">
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-primary">$9.99</span>
                      <span className="text-lg text-black/50 dark:text-white/50">/month</span>
                    </div>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-center gap-2">
                        <Icon icon="tabler:check" className="text-primary" />
                        <span className="text-dark dark:text-white">Unlimited meal plans</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon icon="tabler:check" className="text-primary" />
                        <span className="text-dark dark:text-white">Personalized nutrition</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon icon="tabler:check" className="text-primary" />
                        <span className="text-dark dark:text-white">Meal swapping</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon icon="tabler:check" className="text-primary" />
                        <span className="text-dark dark:text-white">7-day free trial</span>
                      </li>
                    </ul>
                  </div>

                  <div id="paypal-button-container" className="mb-4"></div>

                  <p className="text-sm text-black/50 dark:text-white/50">
                    After your 7-day free trial, you'll be charged $9.99/month. Cancel anytime.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Active Subscription */}
                  <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center">
                    <Icon
                      icon={isActive ? "tabler:check-circle" : "tabler:x-circle"}
                      width="60"
                      height="60"
                      className={`mx-auto mb-4 ${
                        isActive ? "text-green-500" : "text-red-500"
                      }`}
                    />
                    <h3 className="mb-2 text-2xl font-semibold text-dark dark:text-white">
                      {subscription.status === "trial" ? "Free Trial Active" : "Subscription Active"}
                    </h3>
                    <p className="text-black/50 dark:text-white/50">
                      Status: <span className="font-semibold capitalize">{subscription.status}</span>
                    </p>
                  </div>

                  {/* Subscription Details */}
                  <div className="mb-8 space-y-4">
                    {subscription.trialEndDate && subscription.status === "trial" && (
                      <div className="flex items-center justify-between rounded-lg border border-dark_border p-4">
                        <span className="text-dark dark:text-white">Trial Ends</span>
                        <span className="font-semibold text-dark dark:text-white">
                          {new Date(subscription.trialEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {subscription.lastPaymentDate && (
                      <div className="flex items-center justify-between rounded-lg border border-dark_border p-4">
                        <span className="text-dark dark:text-white">Last Payment</span>
                        <span className="font-semibold text-dark dark:text-white">
                          {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {isActive && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="w-full rounded-md border border-red-500 px-5 py-3 text-base font-medium text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      {cancelling ? <Loader /> : "Cancel Subscription"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PayPal SDK */}
      <script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        data-sdk-integration-source="button-factory"
      ></script>
    </section>
  );
};

export default Subscription;