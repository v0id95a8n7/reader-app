import React, { useState, useEffect, useRef } from "react";
import { AdjustmentsHorizontalIcon, XMarkIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

interface Settings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: "left" | "center" | "right" | "justify";
  showImages: boolean;
  showVideos: boolean;
}

interface FloatingButtonsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onScrollToTop: () => void;
}

export function FloatingButtons({
  settings,
  onSettingsChange,
  onScrollToTop,
}: FloatingButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
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
    <div className="fixed right-6 bottom-6 z-50 flex flex-col space-y-3">
      {!isOpen && (
        <button
          onClick={onScrollToTop}
          className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-md transition-all duration-200 hover:bg-gray-100"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleSettings}
          className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-md transition-all duration-200 hover:bg-gray-100"
          aria-label="Open reader settings"
          aria-expanded={isOpen}
          aria-controls="settings-popover"
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" />
        </button>

        {isOpen && (
          <div
            id="settings-popover"
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            className="font-nunito absolute bottom-full right-0 mb-2 w-80 transform rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 ease-in-out"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-nunito text-lg font-bold text-gray-700">
                Reader Settings
              </h3>
              <button
                onClick={toggleSettings}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Font Size */}
              <div className="border-b border-gray-200 pb-4">
                <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                  Font Size: {settings.fontSize}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFontSizeChange(Math.max(14, settings.fontSize - 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    aria-label="Decrease font size"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded bg-gray-200 accent-gray-500"
                  />
                  <button
                    onClick={() => handleFontSizeChange(Math.min(24, settings.fontSize + 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    aria-label="Increase font size"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="border-b border-gray-200 pb-4">
                <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                  Font Family
                </label>
                <div className="flex flex-col space-y-2 mt-1">
                  <label className="font-nunito flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="fontFamily"
                      value="PT Serif"
                      checked={settings.fontFamily === "PT Serif"}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className="mr-2 h-4 w-4 accent-gray-500"
                    />
                    PT Serif
                  </label>
                  <label className="font-nunito flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="fontFamily"
                      value="PT Sans"
                      checked={settings.fontFamily === "PT Sans"}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className="mr-2 h-4 w-4 accent-gray-500"
                    />
                    PT Sans
                  </label>
                </div>
              </div>

              {/* Line Height */}
              <div className="border-b border-gray-200 pb-4">
                <label className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                  Line Height: {settings.lineHeight}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLineHeightChange(Math.max(1.2, parseFloat((settings.lineHeight - 0.1).toFixed(1))))}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    aria-label="Decrease line height"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded bg-gray-200 accent-gray-500"
                  />
                  <button
                    onClick={() => handleLineHeightChange(Math.min(2.0, parseFloat((settings.lineHeight + 0.1).toFixed(1))))}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    aria-label="Increase line height"
                  >
                    +
                  </button>
                </div>
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
                    checked={false}
                    disabled
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 opacity-50 peer-checked:bg-gray-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
