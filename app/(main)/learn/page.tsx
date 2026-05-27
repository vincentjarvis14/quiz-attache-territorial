import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getSousThemesWithProgress,
  getUserProgress,
} from "@/db/queries";

import { SousThemeGrid } from "./sous-theme-grid";
import { Header } from "./header";

const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const sousThemesData = getSousThemesWithProgress();

  const [userProgress, sousThemesList] = await Promise.all([
    userProgressData,
    sousThemesData,
  ]);

  if (!userProgress || !userProgress.activeTheme) {
    redirect("/courses");
  }

  const themeTitle = userProgress.activeTheme.title;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeTheme={userProgress.activeTheme}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={themeTitle} />
        <div className="px-1">
          <SousThemeGrid sousThemes={sousThemesList} />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
