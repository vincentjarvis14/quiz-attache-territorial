import { redirect } from "next/navigation";

import { getThemes, getUserProgress } from "@/db/queries";
import { List } from "./list";

const CoursesPage = async () => {
  const themesData = getThemes();
  const userProgressData = getUserProgress();

  const [themes, userProgress] = await Promise.all([
    themesData,
    userProgressData,
  ]);

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-slate-700">
        Choisis ton thème
      </h1>
      <List
        themes={themes}
        activeThemeId={userProgress?.activeThemeId}
      />
    </div>
  );
};

export default CoursesPage;
