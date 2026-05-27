"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { themes } from "@/db/schema";
import { Card } from "./card";
import { upsertUserProgress } from "@/actions/user-progress";

type Props = {
  themes: typeof themes.$inferSelect[];
  activeThemeId?: number | null;
};

export const List = ({ themes, activeThemeId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;

    startTransition(() => {
      upsertUserProgress(id)
        .then(() => router.push("/learn"))
        .catch(() => {});
    });
  };

  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          id={theme.id}
          title={theme.title}
          imageSrc={theme.imageSrc}
          matiere={theme.matiere}
          onClick={onClick}
          disabled={pending}
          active={theme.id === activeThemeId}
        />
      ))}
    </div>
  );
};
