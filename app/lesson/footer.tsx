"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  pdfFileName?: string;
  sourceChunk?: string;
  sourceSection?: string | null;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  pdfFileName,
  sourceChunk,
  sourceSection,
}: Props) => {
  return (
    <motion.footer
      layout
      animate={{
        backgroundColor:
          status === "correct"
            ? "rgb(220 252 231)"
            : status === "wrong"
            ? "rgb(255 228 230)"
            : "rgb(255 255 255)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "lg:h-[140px] h-[100px] border-t-2",
        status === "correct" && "border-transparent",
        status === "wrong" && "border-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        <AnimatePresence mode="wait">
          {status === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center text-green-500 font-bold text-base lg:text-2xl">
                <Check className="h-6 w-6 lg:h-10 lg:w-10 mr-2" />
                Bonne réponse !
              </div>
              {pdfFileName && sourceChunk && (
                <SourceBadge
                  pdfFileName={pdfFileName}
                  sourceChunk={sourceChunk}
                  sourceSection={sourceSection}
                />
              )}
            </motion.div>
          )}
          {status === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center text-rose-500 font-bold text-base lg:text-2xl">
                <X className="h-6 w-6 lg:h-10 lg:w-10 mr-2" />
                Mauvaise réponse
              </div>
              {pdfFileName && sourceChunk && (
                <SourceBadge
                  pdfFileName={pdfFileName}
                  sourceChunk={sourceChunk}
                  sourceSection={sourceSection}
                />
              )}
            </motion.div>
          )}
          {status === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant="default"
                size="lg"
                onClick={() => window.location.href = `/lesson/${lessonId}`}
              >
                Pratiquer à nouveau
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size="lg"
          variant={status === "none" ? "primary" : "secondary"}
        >
          {status === "none" && "Vérifier"}
          {status === "correct" && "Suivant"}
          {status === "wrong" && "Réessayer"}
          {status === "completed" && "Continuer"}
        </Button>
      </div>
    </motion.footer>
  );
};
