"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExitModal } from "@/store/use-exit-modal";

export const ExitModal = () => {
  const router = useRouter();
  const { isOpen, close } = useExitModal();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-4 flex w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Quitter la leçon ?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Tu vas perdre ta progression sur cette leçon. Es-tu sûr de vouloir
            quitter ?
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
              Quitter
            </Button>
            <Button
              variant="secondaryOutline"
              size="lg"
              className="w-full"
              onClick={close}
            >
              Continuer la leçon
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
