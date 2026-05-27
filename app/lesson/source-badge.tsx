"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { SourceModal } from "@/components/modals/source-modal";

type Props = {
  pdfFileName: string;
  sourceChunk: string;
  sourceSection?: string | null;
};

export const SourceBadge = ({ pdfFileName, sourceChunk, sourceSection }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-purple-50/80 px-3 py-1 text-xs font-medium text-purple-600 transition hover:bg-purple-100 hover:text-purple-700"
      >
        <FileText className="h-3 w-3" />
        <span>Source : {pdfFileName}</span>
      </button>

      <SourceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pdfFileName={pdfFileName}
        sourceChunk={sourceChunk}
        sourceSection={sourceSection}
      />
    </>
  );
};
