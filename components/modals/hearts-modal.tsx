"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const router = useRouter();
  const { isOpen, close } = useHeartsModal();

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
            Plus de coeurs !
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Tu n'as plus de coeurs. Reviens plus tard ou entraîne-toi sur
            des leçons déjà complétées pour en gagner.
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
                router.push("/shop");
              }}
            >
              Acheter des coeurs
            </Button>
            <Button
              variant="secondaryOutline"
              size="lg"
              className="w-full"
              onClick={close}
            >
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
