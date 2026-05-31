import type { ReactNode } from "react"

// Tokens de coloration syntaxique
export const K = ({ children }: { children: ReactNode }) => <span className="text-coral-400">{children}</span> // keyword
export const S = ({ children }: { children: ReactNode }) => <span className="text-moss-400">{children}</span> // string
export const C = ({ children }: { children: ReactNode }) => <span className="text-cream/30 italic">{children}</span> // comment
export const T = ({ children }: { children: ReactNode }) => <span className="text-amber-300/90">{children}</span> // type
export const F = ({ children }: { children: ReactNode }) => <span className="text-sky-300/90">{children}</span> // function/prop
export const N = ({ children }: { children: ReactNode }) => <span className="text-violet-300/90">{children}</span> // number

export function CodeWindow({
  filename,
  lang = "typescript",
  lines,
  caption,
}: {
  filename: string
  lang?: string
  lines: ReactNode[]
  caption?: ReactNode
}) {
  return (
    <div>
    <div className="overflow-hidden rounded-2xl border border-ink/15 bg-[#1c1a18] shadow-[0_20px_60px_-20px_rgba(31,29,27,0.5)]">
      {/* Barre de titre */}
      <div className="flex items-center gap-2 border-b border-white/8 bg-[#252220] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex items-center gap-2">
          <span className="font-mono text-xs text-cream/70">{filename}</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[10px] text-cream/40">{lang}</span>
        </div>
      </div>

      {/* Corps */}
      <div className="overflow-x-auto">
        <pre className="py-4 text-[12.5px] leading-[1.7]">
          <code className="block font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/[0.03]">
                <span className="w-12 shrink-0 select-none pr-4 text-right text-cream/20">{i + 1}</span>
                <span className="pr-6 text-cream/85">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
      {caption && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-ink/8 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-ink/55 shadow-soft">
          <span className="mt-0.5 shrink-0 text-coral-400">↳</span>
          <span className="[&_strong]:font-semibold [&_strong]:text-ink">{caption}</span>
        </div>
      )}
    </div>
  )
}
