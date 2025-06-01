import React, { useState, useEffect, useRef } from 'react';
import { CogIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
      textAlign: isJustified ? 'justify' : 'left',
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
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div 
          ref={settingsRef}
          className="bg-white shadow-md p-6 w-80 transform transition-all duration-300 ease-in-out font-nunito border border-gray-200 rounded-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-700 font-nunito">Reader Settings</h3>
            <button
              onClick={toggleSettings}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 font-nunito">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-gray-500 rounded"
              />
            </div>
            
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 font-nunito">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 text-gray-600 focus:outline-none font-nunito focus:border-gray-400 focus:ring-1 focus:ring-gray-300 rounded-md cursor-pointer"
              >
                <option value="PT Serif">PT Serif</option>
                <option value="PT Sans">PT Sans</option>
                <option value="PT Mono">PT Mono</option>
              </select>
            </div>
            
            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 font-nunito">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-gray-500 rounded"
              />
            </div>
            
            {/* Text Align */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 font-nunito">
                Justify Text
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.textAlign === 'justify'}
                  onChange={(e) => handleTextAlignChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
              </label>
            </div>
            
            {/* Show Images */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 font-nunito">
                Show Images
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showImages}
                  onChange={(e) => handleShowImagesChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
              </label>
            </div>
            
            {/* Show Videos */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 font-nunito">
                Show Videos <span className="text-xs text-gray-400 font-nunito">(coming soon)</span>
              </label>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={settings.showVideos}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 opacity-50 peer-focus:outline-none peer rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleSettings}
          className="bg-white text-gray-500 p-3 shadow-md hover:bg-gray-100 transition-all duration-200 border border-gray-200 rounded-full cursor-pointer"
          aria-label="Open reader settings"
        >
          <CogIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
} 