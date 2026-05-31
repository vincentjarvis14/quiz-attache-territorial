"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { pdfUrl } from "@/lib/pdf-url";
import { cn } from "@/lib/utils";

// Worker servi statiquement depuis public/ (copié depuis pdfjs-dist)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function PdfViewerModal({
  open,
  onOpenChange,
  slug,
  page,
  title,
  highlight,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  slug: string | null;
  page: number;
  title: string;
  highlight?: string | null;
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const roRef = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(0);

  const fileUrl = useMemo(() => (slug ? pdfUrl(slug) : null), [slug]);

  // Callback ref : se déclenche exactement quand Radix monte le conteneur dans
  // le Portal (un useEffect classique tournerait trop tôt, avant le montage).
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    const update = () => {
      const w = Math.floor(node.clientWidth - 8);
      if (w > 0) setWidth((prev) => (Math.abs(prev - w) > 4 ? w : prev));
    };
    update(); // mesure synchrone immédiate
    const ro = new ResizeObserver(update);
    ro.observe(node);
    roRef.current = ro;
  }, []);

  // Réinitialise à la page cible à chaque ouverture
  useEffect(() => {
    if (open) {
      setCurrentPage(page);
      setScale(1);
      setLoadError(false);
    }
  }, [open, page, slug]);

  useEffect(() => () => roRef.current?.disconnect(), []);

  // Surligne le terme recherché dans la couche texte
  const textRenderer = useMemo(() => {
    if (!highlight || highlight.length < 2) return undefined;
    const re = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
    return (textItem: { str: string }) =>
      textItem.str.replace(re, "<mark>$1</mark>");
  }, [highlight]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(numPages || p, p + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-4xl flex-col gap-0 overflow-hidden bg-stone-100 p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Barre d'outils */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/[0.08] bg-white px-5 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-coral-500" />
            <span className="truncate text-sm font-semibold text-ink">{title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
              className="rounded-lg p-1.5 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Dézoomer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="rounded-lg p-1.5 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Zoomer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Zone PDF */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-stone-200/60 px-4 py-5 [&_.react-pdf\_\_Page]:mx-auto [&_.react-pdf\_\_Page]:mb-4 [&_.react-pdf\_\_Page]:shadow-lg [&_mark]:bg-amber-300/70 [&_mark]:text-transparent"
        >
          {fileUrl && !loadError && (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setLoadError(true)}
              loading={
                <div className="flex items-center justify-center py-24 text-ink/40">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                width={width || undefined}
                scale={scale}
                customTextRenderer={textRenderer}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
          {loadError && (
            <div className="flex flex-col items-center gap-2 py-24 text-center">
              <FileText className="h-8 w-8 text-ink/20" />
              <p className="text-sm text-ink/50">Impossible de charger le PDF.</p>
            </div>
          )}
        </div>

        {/* Navigation pages */}
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-ink/[0.08] bg-white px-5 py-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentPage <= 1}
            className={cn(
              "rounded-lg p-2 transition-colors",
              currentPage <= 1
                ? "text-ink/20"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink",
            )}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium tabular-nums text-ink/70">
            Page {currentPage}{numPages ? ` / ${numPages}` : ""}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!!numPages && currentPage >= numPages}
            className={cn(
              "rounded-lg p-2 transition-colors",
              !!numPages && currentPage >= numPages
                ? "text-ink/20"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink",
            )}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
