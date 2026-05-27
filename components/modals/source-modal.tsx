"use client";

import { FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pdfFileName: string;
  sourceChunk: string;
  sourceSection?: string | null;
};

export const SourceModal = ({
  isOpen,
  onClose,
  pdfFileName,
  sourceChunk,
  sourceSection,
}: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:mx-4"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-800">
                  Source du document
                </h3>
                <p className="text-sm text-slate-500">{pdfFileName}</p>
              </div>
            </div>

            {/* Section title */}
            {sourceSection && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                <FileText className="h-3 w-3" />
                {sourceSection}
              </div>
            )}

            {/* Content */}
            <div className="max-h-[300px] overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="whitespace-pre-line">{sourceChunk}</p>
            </div>

            {/* Footer */}
            <p className="mt-4 text-xs text-slate-400">
              Extrait du document officiel utilisé pour générer cette question.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
