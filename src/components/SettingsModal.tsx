import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

interface SettingsModalProps {
  onClose: () => void;
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>;
}

type SettingsTab = "profile" | "ai-summary";

interface UserSettings {
  // Reading settings
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  textAlign?: string;
  showImages?: boolean;
  showVideos?: boolean;
  // Summary settings
  showSummaryButton: boolean;
}

export function SettingsModal({ onClose, anchorRef }: SettingsModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // AI Summary Settings
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 18,
    fontFamily: "PT Serif",
    lineHeight: 1.6,
    textAlign: "left",
    showImages: true,
    showVideos: true,
    showSummaryButton: true,
  });
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Position the modal relative to the button
  useLayoutEffect(() => {
    if (anchorRef.current && modalRef.current) {
      const buttonRect = anchorRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();

      // Position below the button
      const top = buttonRect.bottom + 8;

      // Center align with button or adjust to not go off-screen
      let left = buttonRect.left - modalRect.width / 2 + buttonRect.width / 2;

      // Ensure it doesn't go off the right edge
      const rightEdge = left + modalRect.width;
      const windowWidth = window.innerWidth;

      if (rightEdge > windowWidth - 16) {
        left = windowWidth - modalRect.width - 16;
      }

      // Ensure it doesn't go off the left edge
      if (left < 16) {
        left = 16;
      }

      setPosition({ top, left });
    }
  }, [anchorRef]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        anchorRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, anchorRef]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json() as { name?: string; email?: string };
        setUsername(userData.name ?? "");
        setEmail(userData.email ?? "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchSettings = async () => {
      try {
        setIsSettingsLoading(true);
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");

        const data = await response.json() as Partial<UserSettings>;
        setSettings({
          // Keep all the existing reading settings
          fontSize: data.fontSize ?? 18,
          fontFamily: data.fontFamily ?? "PT Serif",
          lineHeight: data.lineHeight ?? 1.6,
          textAlign: data.textAlign ?? "left",
          showImages: data.showImages ?? true,
          showVideos: data.showVideos ?? true,
          // Add the new AI summary settings
          showSummaryButton: data.showSummaryButton ?? true,
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSettingsError("Failed to load settings");
      } finally {
        setIsSettingsLoading(false);
      }
    };

    void fetchUserData();
    void fetchSettings();
  }, []);

  const handleSaveProfile = async () => {
    setUserError(null);
    setUserSuccess(null);

    try {
      setIsUserLoading(true);

      // Check if changing password
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
          setUserError("Current password is required");
          return;
        }

        if (!newPassword) {
          setUserError("New password is required");
          return;
        }

        if (newPassword !== confirmPassword) {
          setUserError("New passwords do not match");
          return;
        }
      }

      // Update user data
      const payload: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      if (username !== session?.user?.name) {
        payload.name = username;
      }

      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setUserError("No changes detected");
        return;
      }

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? "Failed to update profile");
      }

      setUserSuccess("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setUserError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsError("");
      setIsSettingsLoading(true);

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Include all settings, not just the AI summary ones
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          lineHeight: settings.lineHeight,
          textAlign: settings.textAlign,
          showImages: settings.showImages,
          showVideos: settings.showVideos,
          showSummaryButton: settings.showSummaryButton,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? "Failed to save settings");
      }

      // Save summary settings to localStorage for quick access
      localStorage.setItem("summarySettings", JSON.stringify({ 
        showSummaryButton: settings.showSummaryButton 
      }));

      setSettingsSuccess("Settings saved successfully");
      
      // Dispatch event to notify other components of settings changes
      window.dispatchEvent(
        new CustomEvent("settingsUpdated", {
          detail: { 
            showSummaryButton: settings.showSummaryButton === true 
          }
        })
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettingsError(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSettingsLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed z-50 rounded-lg border border-gray-200 bg-white p-5 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "360px",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-nunito text-xl font-semibold text-gray-800">
          Settings
        </h2>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-5 flex gap-1 rounded-2xl bg-gray-200 p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 cursor-pointer rounded-xl py-2 text-sm font-medium ${
            activeTab === "profile"
              ? "bg-white text-gray-800"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("ai-summary")}
          className={`flex-1 cursor-pointer rounded-xl py-2 text-sm font-medium ${
            activeTab === "ai-summary"
              ? "bg-white text-gray-800"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          AI Summary
        </button>
      </div>

      {activeTab === "profile" ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="font-nunito mb-1 block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-nunito w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="font-nunito mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="font-nunito w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div className="pt-2">
            <div className="mb-3">
              <label
                htmlFor="current-password"
                className="font-nunito mb-1 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="font-nunito w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="new-password"
                className="font-nunito mb-1 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-nunito w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="font-nunito mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-nunito w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {userError && <p className="text-sm text-red-500">{userError}</p>}
          {userSuccess && (
            <p className="text-sm text-green-600">{userSuccess}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={isUserLoading}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            >
              {isUserLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="show-summary"
              className="font-nunito text-sm font-medium text-gray-700"
            >
              Show Summary Button
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                id="show-summary"
                checked={settings.showSummaryButton}
                onChange={() =>
                  setSettings({
                    ...settings,
                    showSummaryButton: !settings.showSummaryButton,
                  })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          <p className="text-sm text-gray-500">
            When enabled, a summary button will appear when viewing articles
          </p>

          {settingsError && (
            <p className="text-sm text-red-500">{settingsError}</p>
          )}
          {settingsSuccess && (
            <p className="text-sm text-green-600">{settingsSuccess}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={isSettingsLoading}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none cursor-pointer"
            >
              {isSettingsLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
