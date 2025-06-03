import React, { useLayoutEffect, useEffect, useRef } from "react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>;
  isLoading?: boolean;
}

export function LogoutModal({ onClose, onConfirm, anchorRef, isLoading = false }: LogoutModalProps) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Position the modal relative to the button
  useLayoutEffect(() => {
    if (anchorRef.current && modalRef.current) {
      const buttonRect = anchorRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      const top = buttonRect.bottom + 8;
      let left = buttonRect.left - (modalRect.width / 2) + (buttonRect.width / 2);
      const rightEdge = left + modalRect.width;
      const windowWidth = window.innerWidth;
      
      if (rightEdge > windowWidth - 16) {
        left = windowWidth - modalRect.width - 16;
      }
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
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, anchorRef]);

  return (
    <div 
      ref={modalRef}
      className="fixed z-50 rounded-lg border border-gray-200 bg-white p-5 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '300px',
        maxWidth: 'calc(100vw - 32px)'
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-nunito text-xl font-semibold text-gray-800">Log Out</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Are you sure you want to log out?
      </p>

      <div className="flex justify-between gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 cursor-pointer"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            "Log out"
          )}
        </button>
      </div>
    </div>
  );
}
