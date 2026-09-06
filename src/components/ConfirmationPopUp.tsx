import React from "react";
import { AiOutlineWarning } from "react-icons/ai";


interface ConfirmationPopupProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
}) => {
  return (
    <div className="fixed top-0 inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-2xl shadow-lg w-96 max-w-full">
        {/* Icon */}
        <div className="flex justify-center items-center  mb-4">
          <div className="bg-red-100 p-4 rounded-full shadow-md">
            <AiOutlineWarning className="text-red-600 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
