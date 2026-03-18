// src/components/Settings/index.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Loader from "@/components/Common/Loader";
import Logo from "@/components/Layout/Header/Logo";
import { profileAPI, preferencesAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const goalOptions = [
  { value: "lose",     label: "Giảm cân",   icon: "tabler:trending-down" },
  { value: "maintain", label: "Duy trì",    icon: "tabler:scale" },
  { value: "gain",     label: "Tăng cân",   icon: "tabler:trending-up" },
];

const activityOptions = [
  { value: "sedentary",   label: "Không tập luyện", icon: "tabler:sofa" },
  { value: "light",       label: "Chỉ đi bộ",       icon: "tabler:walk" },
  { value: "moderate",    label: "1–2 lần / tuần",  icon: "tabler:run" },
  { value: "active",      label: "3–5 lần / tuần",  icon: "tabler:barbell" },
  { value: "very_active", label: "Hằng ngày",        icon: "tabler:flame" },
];

const dietOptions = [
  { value: "standard",   label: "Thông thường", icon: "tabler:tools-kitchen-2" },
  { value: "vegetarian", label: "Chay",          icon: "tabler:leaf" },
  { value: "vegan",      label: "Thuần chay",    icon: "tabler:plant" },
];

const allergyOptions = [
  { value: "dairy",     label: "Sữa",           icon: "tabler:glass-full" },
  { value: "nuts",      label: "Hạt",            icon: "tabler:seeding" },
  { value: "gluten",    label: "Gluten",         icon: "tabler:wheat" },
  { value: "soy",       label: "Đậu nành",      icon: "tabler:seeding" },
  { value: "eggs",      label: "Trứng",          icon: "tabler:egg" },
  { value: "shellfish", label: "Hải sản có vỏ", icon: "tabler:fish" },
];

const inputClass = "w-full rounded-xl border border-gray-600 bg-gray-900 px-5 py-3 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon icon={icon} width="18" height="18" className="text-primary" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  );
}

function OptionRow({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer mb-2.5 ${
        selected ? "border-primary bg-primary/10" : "border-gray-600 bg-gray-900 hover:border-gray-500"
      }`}
    >
      <span className={`text-sm font-medium ${selected ? "text-primary" : "text-gray-300"}`}>{label}</span>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary/20" : "bg-gray-700"}`}>
        <Icon icon={icon} width="18" height="18" className={selected ? "text-primary" : "text-gray-400"} />
      </span>
    </button>
  );
}

function VisualCard({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
        selected ? "border-primary bg-primary/10" : "border-gray-600 bg-gray-900 hover:border-gray-500"
      }`}
    >
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${selected ? "bg-primary/20" : "bg-gray-700"}`}>
        <Icon icon={icon} width="22" height="22" className={selected ? "text-primary" : "text-gray-400"} />
      </span>
      <span className={`text-xs font-semibold text-center leading-tight ${selected ? "text-primary" : "text-gray-300"}`}>{label}</span>
    </button>
  );
}

const Settings = () => {
  const { loading: authLoading } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "", age: "", gender: "male",
    height: "", weight: "", activityLevel: "sedentary", goal: "maintain",
  });

  const [preferencesData, setPreferencesData] = useState({
    dietType: "standard", allergies: [] as string[],
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const profileRes = await profileAPI.get().catch(() => null);
      const preferencesRes = await preferencesAPI.get().catch(() => null);
      if (profileRes?.data) {
        setProfileData({
          name: profileRes.data.name || "",
          age: profileRes.data.age?.toString() || "",
          gender: profileRes.data.gender,
          height: profileRes.data.height?.toString() || "",
          weight: profileRes.data.weight?.toString() || "",
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
    } catch {
      toast.error("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleAllergyToggle = (v: string) => {
    setPreferencesData(p => ({
      ...p,
      allergies: p.allergies.includes(v) ? p.allergies.filter(a => a !== v) : [...p.allergies, v],
    }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profilePayload = {
        name: profileData.name,
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
      await profileAPI.update(profilePayload).catch(() => profileAPI.create(profilePayload));
      await preferencesAPI.update(preferencesPayload).catch(() => preferencesAPI.create(preferencesPayload));
      toast.success("Đã cập nhật cài đặt thành công!");
      router.push("/dashboard");
    } catch {
      toast.error("Không thể cập nhật cài đặt");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0f0e0d" }}><Loader /></div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0f0e0d" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,14,13,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium transition"
              style={{ color: "rgba(245,240,234,0.5)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f5f0ea"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,234,0.5)"}>
              <Icon icon="tabler:arrow-left" width="18" height="18" />
              Dashboard
            </button>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
            <span className="text-sm font-medium text-white">Cài đặt</span>
          </div>
          <Logo />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        <form onSubmit={handleSave} className="space-y-3">

          {/* ── Personal info ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <SectionHeader icon="tabler:user" title="Thông tin cá nhân" />
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tên</label>
              <input type="text" placeholder="Tên của bạn" value={profileData.name}
                onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Tuổi</label>
                <input type="number" placeholder="25" value={profileData.age}
                  onChange={e => setProfileData(p => ({ ...p, age: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Giới tính</label>
                <select value={profileData.gender}
                  onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))}
                  className="w-full rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-base text-white outline-none transition focus:border-primary">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Chiều cao</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="165" value={profileData.height}
                    onChange={e => setProfileData(p => ({ ...p, height: e.target.value }))}
                    className={inputClass} />
                  <span className="text-gray-500 text-sm font-medium">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Cân nặng</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="60" value={profileData.weight}
                    onChange={e => setProfileData(p => ({ ...p, weight: e.target.value }))}
                    className={inputClass} />
                  <span className="text-gray-500 text-sm font-medium">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Goal ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <SectionHeader icon="tabler:target" title="Mục tiêu" />
            <div className="flex gap-3">
              {goalOptions.map(o => (
                <VisualCard key={o.value} icon={o.icon} label={o.label}
                  selected={profileData.goal === o.value}
                  onClick={() => setProfileData(p => ({ ...p, goal: o.value }))} />
              ))}
            </div>
          </div>

          {/* ── Activity ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <SectionHeader icon="tabler:run" title="Mức độ vận động" />
            {activityOptions.map(o => (
              <OptionRow key={o.value} icon={o.icon} label={o.label}
                selected={profileData.activityLevel === o.value}
                onClick={() => setProfileData(p => ({ ...p, activityLevel: o.value }))} />
            ))}
          </div>

          {/* ── Diet ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <SectionHeader icon="tabler:leaf" title="Chế độ ăn uống" />
            {dietOptions.map(o => (
              <OptionRow key={o.value} icon={o.icon} label={o.label}
                selected={preferencesData.dietType === o.value}
                onClick={() => setPreferencesData(p => ({ ...p, dietType: o.value }))} />
            ))}
          </div>

          {/* ── Allergies ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <SectionHeader icon="tabler:alert-triangle" title="Dị ứng thực phẩm" />
            <p className="text-gray-500 text-xs mb-4">Chọn tất cả những gì áp dụng</p>
            <div className="grid grid-cols-2 gap-2.5">
              {allergyOptions.map(o => (
                <button key={o.value} type="button" onClick={() => handleAllergyToggle(o.value)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    preferencesData.allergies.includes(o.value)
                      ? "border-primary bg-primary/10"
                      : "border-gray-600 bg-gray-900 hover:border-gray-500"
                  }`}>
                  <Icon icon={o.icon} width="16" height="16"
                    className={preferencesData.allergies.includes(o.value) ? "text-primary" : "text-gray-400"} />
                  <span className={`text-sm font-medium ${preferencesData.allergies.includes(o.value) ? "text-primary" : "text-gray-300"}`}>
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2 pb-6">
            <button type="button" onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-xl border border-gray-600 bg-transparent px-5 py-3 text-base font-medium text-gray-400 transition hover:bg-gray-700">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader /> : <><Icon icon="tabler:check" width="18" height="18" />Lưu thay đổi</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Settings;