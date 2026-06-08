import type { Metadata } from "next"
import { MotionConfig } from "framer-motion"
import { Header } from "../header"
import { Footer } from "../footer"
import { ScrollNavMenu } from "./scroll-nav-menu"
import { ReadingProgress } from "./reading-progress"
import { TableOfContents } from "./table-of-contents"

export const metadata: Metadata = {
  title: "Rapport technique — Quiz Attaché Territorial",
  description: "Architecture, stack, pipeline RAG et démarche Vibe Coding du projet Quiz Attaché Territorial.",
}

export default function PresentationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <MotionConfig reducedMotion="user">
        <ReadingProgress />
        <Header />
        <ScrollNavMenu />
        <TableOfContents />
        <main className="flex-1">{children}</main>
        <Footer />
      </MotionConfig>
    </div>
  )
}
