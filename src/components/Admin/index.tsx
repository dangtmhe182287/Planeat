"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { adminAPI, getAuthToken } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type PendingUser = {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  status: string;
  subscriptionEnd?: string;
  pendingRequest: boolean;
};

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Admin = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [granting, setGranting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const token = getAuthToken();
    const decoded = token ? parseJwt(token) : null;
    if (!decoded?.isAdmin) {
      router.push("/dashboard");
      return;
    }
    loadPending();
  }, [authLoading]);

  const loadPending = async () => {
    try {
      const response = await adminAPI.getPending();
      setPending(response.data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (userId: string) => {
    setGranting(userId);
    try {
      await adminAPI.grantSubscription(userId);
      toast.success("Đã kích hoạt đăng ký");
      loadPending();
    } catch (error: any) {
      toast.error("Không thể kích hoạt đăng ký");
    } finally {
      setGranting(null);
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

        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
            Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Yêu cầu kích hoạt đang chờ xử lý
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="tabler:inbox" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Không có yêu cầu nào đang chờ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.userId?.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Trạng thái hiện tại:{" "}
                    <span className={item.status === "active" ? "text-green-500" : "text-red-500"}>
                      {item.status === "active" ? "Đang hoạt động" : "Hết hạn"}
                    </span>
                    {item.subscriptionEnd && item.status === "active" && (
                      <> · đến {new Date(item.subscriptionEnd).toLocaleDateString("vi-VN")}</>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => handleGrant(item.userId._id)}
                  disabled={granting === item.userId._id}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {granting === item.userId._id ? (
                    <Loader />
                  ) : (
                    <>
                      <Icon icon="tabler:plus" width="18" height="18" />
                      Gia hạn 30 ngày
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Admin;