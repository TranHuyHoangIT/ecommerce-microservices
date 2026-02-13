"use client";
// Settings Page - Cài đặt tài khoản
// User preferences and account settings

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  Palette,
  Shield,
  Mail,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false,
    
    // Privacy
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    
    // Preferences
    language: "vi",
    currency: "VND",
    theme: "light",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Đã lưu cài đặt thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Cài đặt
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý tùy chọn và quyền riêng tư
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications Section */}
          <SettingsSection
            icon={Bell}
            title="Thông báo"
            description="Quản lý các loại thông báo bạn muốn nhận"
          >
            <ToggleSetting
              label="Thông báo qua Email"
              description="Nhận thông báo qua email"
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
            />
            <ToggleSetting
              label="Thông báo qua SMS"
              description="Nhận thông báo qua tin nhắn"
              checked={settings.smsNotifications}
              onChange={() => handleToggle("smsNotifications")}
            />
            <ToggleSetting
              label="Thông báo đẩy"
              description="Nhận thông báo trên trình duyệt"
              checked={settings.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
            />
            <ToggleSetting
              label="Cập nhật đơn hàng"
              description="Nhận thông báo về trạng thái đơn hàng"
              checked={settings.orderUpdates}
              onChange={() => handleToggle("orderUpdates")}
            />
            <ToggleSetting
              label="Khuyến mãi"
              description="Nhận thông tin về các chương trình khuyến mãi"
              checked={settings.promotions}
              onChange={() => handleToggle("promotions")}
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection
            icon={Shield}
            title="Quyền riêng tư"
            description="Kiểm soát thông tin cá nhân của bạn"
          >
            <SelectSetting
              label="Hiển thị hồ sơ"
              description="Ai có thể xem hồ sơ của bạn"
              value={settings.profileVisibility}
              onChange={(value) => handleSelect("profileVisibility", value)}
              options={[
                { value: "public", label: "Công khai" },
                { value: "friends", label: "Bạn bè" },
                { value: "private", label: "Riêng tư" }
              ]}
            />
            <ToggleSetting
              label="Hiển thị Email"
              description="Cho phép người khác xem email của bạn"
              checked={settings.showEmail}
              onChange={() => handleToggle("showEmail")}
            />
            <ToggleSetting
              label="Hiển thị số điện thoại"
              description="Cho phép người khác xem số điện thoại của bạn"
              checked={settings.showPhone}
              onChange={() => handleToggle("showPhone")}
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection
            icon={Palette}
            title="Tùy chọn"
            description="Tùy chỉnh trải nghiệm của bạn"
          >
            <SelectSetting
              label="Ngôn ngữ"
              description="Chọn ngôn ngữ hiển thị"
              value={settings.language}
              onChange={(value) => handleSelect("language", value)}
              options={[
                { value: "vi", label: "Tiếng Việt" },
                { value: "en", label: "English" }
              ]}
            />
            <SelectSetting
              label="Đơn vị tiền tệ"
              description="Chọn đơn vị tiền tệ hiển thị"
              value={settings.currency}
              onChange={(value) => handleSelect("currency", value)}
              options={[
                { value: "VND", label: "VND (₫)" },
                { value: "USD", label: "USD ($)" }
              ]}
            />
            <SelectSetting
              label="Giao diện"
              description="Chọn giao diện sáng hoặc tối"
              value={settings.theme}
              onChange={(value) => handleSelect("theme", value)}
              options={[
                { value: "light", label: "Sáng" },
                { value: "dark", label: "Tối" },
                { value: "auto", label: "Tự động" }
              ]}
            />
          </SettingsSection>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    </motion.div>
  );
}

function ToggleSetting({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: () => void;
}) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <motion.button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gray-300"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

function SelectSetting({ 
  label, 
  description, 
  value, 
  onChange,
  options 
}: { 
  label: string; 
  description: string; 
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
