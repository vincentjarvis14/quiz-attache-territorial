"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
  const router = useRouter();
  const { isOpen, close } = usePracticeModal();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-4 flex w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-8 w-8 fill-purple-500 text-purple-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Leçon terminée ! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Tu as terminé cette leçon. Continue comme ça pour maîtriser tous les
            sujets du concours !
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4 flex flex-col gap-y-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                close();
                router.push("/learn");
              }}
            >
              Continuer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
