import { XIcon } from "lucide-react";

/**
 * overlay card with dark blurred bg
 * @param open - open flag
 * @param onClose - closing operation function
 * @returns
 */
export default function OverlayCard({ open, onClose, children }) {
  if (!open) return null; // don’t render if closed

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-top
     pt-[20vh] justify-center z-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-9/10 max-w-md h-min p-6 relative">
        {/* Close button */}
        <XIcon
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        />

        {children}
      </div>
    </div>
  );
}
