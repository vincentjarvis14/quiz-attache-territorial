"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { challenges } from "@/db/schema";

type Props = {
  id: number;
  text: string;
  imageSrc: string | null;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  status?: "correct" | "wrong" | "none";
  audioSrc: string | null;
  disabled?: boolean;
  type: typeof challenges.$inferSelect["type"];
};

export const Card = ({
  id,
  text,
  imageSrc,
  shortcut,
  selected,
  onClick,
  status,
  audioSrc,
  disabled,
  type,
}: Props) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      animate={
        status === "correct"
          ? { scale: [1, 1.05, 1] }
          : status === "wrong"
          ? { x: [0, -8, 8, -8, 8, 0] }
          : { scale: 1, x: 0 }
      }
      transition={
        status === "correct"
          ? { duration: 0.3 }
          : status === "wrong"
          ? { duration: 0.4 }
          : { type: "spring", stiffness: 100, damping: 20 }
      }
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2",
        "flex flex-col items-center justify-between",
        selected && "border-purple-300 bg-purple-50 hover:bg-purple-50",
        selected && status === "correct" && "border-green-300 bg-green-50 hover:bg-green-50 shadow-lg shadow-green-200/50",
        selected && status === "wrong" && "border-rose-300 bg-rose-50 hover:bg-rose-50",
        disabled && "pointer-events-none hover:bg-white",
      )}
    >
      {imageSrc && (
        <div className="mb-4 flex items-center justify-center">
          <img src={imageSrc} alt="" className="h-16 w-16 object-contain" />
        </div>
      )}
      <div className={cn(
        "flex items-center justify-between w-full gap-x-2",
      )}>
        <span className="text-sm lg:text-base text-slate-700 font-medium text-center">
          {text}
        </span>
        <div className={cn(
          "flex items-center justify-center rounded-lg border-2 h-8 w-8 text-xs font-semibold",
          selected ? "border-purple-300 text-purple-500" : "border-slate-300 text-slate-400",
          selected && status === "correct" && "border-green-500 text-green-500",
          selected && status === "wrong" && "border-rose-500 text-rose-500",
        )}>
          {shortcut}
        </div>
      </div>
    </motion.button>
  );
};
