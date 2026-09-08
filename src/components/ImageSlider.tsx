import { useState } from "react";
import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function ImageSlider({
  images,
  alt,
  className,
  emptyText,
}: {
  images: string[];
  alt: string;
  className: string;
  emptyText: string;
}) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  if (!images.length) {
    return (
      <div
        className={`flex w-full items-center justify-center bg-secondary text-sm text-muted-foreground ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <Carousel className="w-full" opts={{ loop: images.length > 1 }}>
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={`${image}-${index}`} className="pl-0">
              <button
                type="button"
                className="group relative block w-full cursor-zoom-in"
                onClick={() => setFullscreenIndex(index)}
              >
                <img
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  className={`w-full bg-secondary object-contain ${className}`}
                  loading="lazy"
                />
                <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-90 shadow-sm transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">ดูภาพเต็มจอ</span>
                </span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 ? (
          <>
            <CarouselPrevious className="left-2 border-background/70 bg-background/80" />
            <CarouselNext className="right-2 border-background/70 bg-background/80" />
            <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
              {images.length} ภาพ
            </div>
          </>
        ) : null}
      </Carousel>

      <Dialog
        open={fullscreenIndex !== null}
        onOpenChange={(open) => !open && setFullscreenIndex(null)}
      >
        <DialogContent className="fixed inset-0 left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden border-0 bg-black p-0 shadow-none sm:rounded-none">
          <DialogTitle className="sr-only">ดูภาพเต็มจอ</DialogTitle>
          <Carousel
            className="h-[100dvh] w-screen overflow-hidden"
            opts={{ loop: images.length > 1, startIndex: fullscreenIndex ?? 0 }}
          >
            <CarouselContent className="-ml-0 h-[100dvh]">
              {images.map((image, index) => (
                <CarouselItem key={`fullscreen-${image}-${index}`} className="h-[100dvh] pl-0">
                  <div className="flex h-[100dvh] w-screen items-center justify-center p-4 sm:p-8">
                    <img
                      src={image}
                      alt={`${alt} ${index + 1}`}
                      className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] object-contain sm:max-h-[calc(100dvh-4rem)] sm:max-w-[calc(100vw-4rem)]"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 ? (
              <>
                <CarouselPrevious className="left-4 border-background/30 bg-background/80" />
                <CarouselNext className="right-4 border-background/30 bg-background/80" />
                <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-sm text-foreground">
                  {images.length} ภาพ
                </div>
              </>
            ) : null}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
