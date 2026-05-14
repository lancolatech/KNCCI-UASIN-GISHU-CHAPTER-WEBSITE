import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { advertisementService } from "@/services/advertisement-service";
import type { Advertisement } from "@/types/advertisement";

const IS_DEV = import.meta.env.DEV;

const DEV_FALLBACK_AD: Advertisement = {
  _id: "dev-fallback-ad",
  tenantId: "69e37354ae0d3b8019eb1625",
  title: "Eldoret International Business Summit 2026",
  badgeText: "Featured Event",
  description:
    "Join 5000+ business leaders, 200+ speakers, and 200+ exhibitors at the flagship trade summit in Eldoret. July 23–25, 2026.",
  imageUrl:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  ctaLabel: "Register Now",
  ctaUrl: "/events",
  openInNewTab: false,
  placement: "homepage",
  priority: 1,
  isActive: true,
  dismissible: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function AdvertisementPopup() {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let popupTimer: ReturnType<typeof setTimeout> | undefined;

    advertisementService
      .getActivePopup()
      .then((data) => {
        if (IS_DEV) {
          console.log("[Advertisement] CMS response:", data);
        }

        if (data) {
          setAd(data);
          popupTimer = setTimeout(() => setOpen(true), 1500);
        } else if (!data && IS_DEV) {
          // Dev fallback so designers can see the popup without CMS data
          console.log("[Advertisement] No active CMS ad found, using dev fallback.");
          setAd(DEV_FALLBACK_AD);
          popupTimer = setTimeout(() => setOpen(true), 1500);
        }
      })
      .catch((err) => {
        if (IS_DEV) {
          console.error("[Advertisement] Failed to fetch:", err);
          // Dev fallback when CMS is unreachable (CORS, network, etc.)
          console.log("[Advertisement] Using dev fallback due to error.");
          setAd(DEV_FALLBACK_AD);
          popupTimer = setTimeout(() => setOpen(true), 1500);
        }
      });

    return () => {
      if (popupTimer) {
        clearTimeout(popupTimer);
      }
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden gap-0 border-0 p-0 rounded-[2rem] bg-white/92 shadow-[0_25px_90px_-30px_rgba(15,23,42,0.58)] backdrop-blur-xl sm:w-[min(calc(100vw-2.5rem),26rem)] md:w-[calc(100vw-2rem)] md:max-w-4xl md:bg-white/95 md:shadow-[0_35px_120px_-35px_rgba(15,23,42,0.65)] dark:bg-slate-950/92 dark:md:bg-slate-950/95">
        <div className="relative grid max-h-[min(82vh,42rem)] grid-rows-[11rem_minmax(0,1fr)] md:max-h-none md:grid-cols-[1.15fr_0.85fr] md:grid-rows-none">
          {/* Dismiss button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-slate-950/55 text-white backdrop-blur-md transition-colors hover:bg-slate-950/75 md:right-4 md:top-4 md:h-9 md:w-9"
            aria-label="Dismiss advertisement"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          {ad.imageUrl && (
            <div className="relative overflow-hidden bg-slate-950 md:min-h-[440px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.32),transparent_34%),linear-gradient(150deg,rgba(15,23,42,0.12),rgba(15,23,42,0.76))]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent md:hidden" />
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="relative z-10 h-full w-full object-cover object-center md:object-contain md:p-6"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-white/90 dark:to-slate-950/90 md:block" />
            </div>
          )}

          {/* Content */}
          <div className="relative flex flex-col justify-center overflow-y-auto bg-white px-5 pb-5 pt-4 dark:bg-slate-950 md:px-8 md:py-10">
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:hidden" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent md:left-0 md:right-auto md:top-8 md:h-[calc(100%-4rem)] md:w-px md:bg-gradient-to-b" />
            <div className="space-y-4 md:space-y-5 md:pl-4">
              {ad.badgeText && (
                <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary md:text-[11px] md:tracking-[0.24em]">
                  {ad.badgeText}
                </span>
              )}

              <div className="space-y-2.5 md:space-y-3">
                <DialogTitle className="max-w-[15ch] text-[1.35rem] font-black leading-[1.05] tracking-tight text-foreground md:max-w-none md:text-[2rem]">
                  {ad.title}
                </DialogTitle>
                <DialogDescription className="max-w-[34ch] text-[13px] leading-6 text-slate-600 dark:text-slate-300 md:max-w-none md:text-[15px] md:leading-7">
                  {ad.description}
                </DialogDescription>
              </div>

              {ad.ctaUrl && (
                <div className="flex flex-col gap-2.5 pt-1.5 sm:flex-row md:gap-3 md:pt-2">
                  <Button asChild className="h-10 rounded-2xl px-5 text-sm font-bold shadow-lg shadow-primary/20 md:h-11 md:rounded-xl md:px-6">
                    <a
                      href={ad.ctaUrl}
                      target={ad.openInNewTab ? "_blank" : "_self"}
                      rel={ad.openInNewTab ? "noopener noreferrer" : undefined}
                      onClick={handleClose}
                    >
                      {ad.ctaLabel || "Learn More"}
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-2xl border-border/50 px-5 text-sm font-bold md:h-11 md:rounded-xl md:px-6"
                    onClick={handleClose}
                  >
                    Maybe later
                  </Button>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-fit pt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground md:pt-1 md:text-xs md:normal-case md:tracking-normal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
