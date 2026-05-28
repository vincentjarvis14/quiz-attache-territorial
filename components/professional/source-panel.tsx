"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, ExternalLink, BookOpen } from "lucide-react";

type Source = {
  title: string;
  reference: string;
  excerpt: string;
  pdfUrl?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
};

export const SourcePanel = ({ isOpen, onClose, sources }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-navy-700" />
                <h2 className="text-base font-semibold text-slate-800">
                  Sources juridiques
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {sources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500">
                    Aucune source disponible pour cette question
                  </p>
                </div>
              ) : (
                sources.map((source, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-200"
                  >
                    {/* Source title */}
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                      {source.title}
                    </h3>

                    {/* Reference */}
                    <p className="text-xs font-medium text-navy-700 mb-3 citation-text">
                      {source.reference}
                    </p>

                    {/* Excerpt */}
                    <div className="relative pl-4 border-l-2 border-burgundy-700 mb-4">
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        &ldquo;{source.excerpt}&rdquo;
                      </p>
                    </div>

                    {/* PDF Link */}
                    {source.pdfUrl && (
                      <a
                        href={source.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-navy-700 hover:text-navy-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Consulter le document original
                      </a>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
