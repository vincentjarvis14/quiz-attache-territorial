import type { Metadata } from "next"
import { Header } from "../header"
import { Footer } from "../footer"
import { PresentationNav } from "./presentation-nav"
import { ReadingProgress } from "./reading-progress"

export const metadata: Metadata = {
  title: "Rapport technique — Quiz Attaché Territorial",
  description: "Architecture, stack, pipeline RAG et démarche Vibe Coding du projet Quiz Attaché Territorial.",
}

export default function PresentationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ReadingProgress />
      <Header />
      <PresentationNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
