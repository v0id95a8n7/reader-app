import React, { useState, useEffect, useRef } from "react";
import { CogIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Settings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: "left" | "center" | "right" | "justify";
  showImages: boolean;
  showVideos: boolean;
}

interface FloatingSettingsButtonProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function FloatingSettingsButton({
  settings,
  onSettingsChange,
}: FloatingSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const handleFontSizeChange = (value: number) => {
    onSettingsChange({
      ...settings,
      fontSize: value,
    });
  };

  const handleFontFamilyChange = (value: string) => {
    onSettingsChange({
      ...settings,
      fontFamily: value,
    });
  };

  const handleLineHeightChange = (value: number) => {
    onSettingsChange({
      ...settings,
      lineHeight: value,
    });
  };

  const handleTextAlignChange = (isJustified: boolean) => {
    onSettingsChange({
      ...settings,
      textAlign: isJustified ? "justify" : "left",
    });
  };

  const handleShowImagesChange = (value: boolean) => {
    onSettingsChange({
      ...settings,
      showImages: value,
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {isOpen ? (
        <div
          ref={settingsRef}
          className="font-nunito w-80 transform rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 ease-in-out"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-nunito text-lg font-bold text-gray-700">
              Reader Settings
            </h3>
            <button
              onClick={toggleSettings}
              className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded bg-gray-200 accent-gray-500"
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="font-nunito w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none"
              >
                <option value="PT Serif">PT Serif</option>
                <option value="PT Sans">PT Sans</option>
              </select>
            </div>

            {/* Line Height */}
            <div>
              <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded bg-gray-200 accent-gray-500"
              />
            </div>

            {/* Text Align */}
            <div className="flex items-center justify-between">
              <label className="font-nunito text-sm font-medium text-gray-600">
                Justify Text
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.textAlign === "justify"}
                  onChange={(e) => handleTextAlignChange(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Show Images */}
            <div className="flex items-center justify-between">
              <label className="font-nunito text-sm font-medium text-gray-600">
                Show Images
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.showImages}
                  onChange={(e) => handleShowImagesChange(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Show Videos */}
            <div className="flex items-center justify-between">
              <label className="font-nunito text-sm font-medium text-gray-600">
                Show Videos{" "}
                <span className="font-nunito text-xs text-gray-400">
                  (coming soon)
                </span>
              </label>
              <label className="relative inline-flex cursor-not-allowed items-center">
                <input
                  type="checkbox"
                  checked={settings.showVideos}
                  disabled
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 opacity-50 peer-checked:bg-gray-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleSettings}
          className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-md transition-all duration-200 hover:bg-gray-100"
          aria-label="Open reader settings"
        >
          <CogIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
