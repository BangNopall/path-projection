import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="app-canvas relative flex min-h-screen items-center justify-center p-6 text-foreground selection:bg-[var(--SGECoralAqua)]/30">
      <div className="ambient-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="glass-surface glass-edge relative z-10 w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--SGEMustardGold)]/40 bg-[var(--SGEMustardGold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--SGEMustardGold)]">
          SGE FILKOM UB · 2026
        </div>
        <h1 className="mt-4 font-display text-7xl font-bold tracking-tight text-white">404</h1>
        <h2 className="mt-2 font-display text-xl font-bold text-white">Halaman Tidak Ditemukan</h2>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
          Kartu atau rute yang kamu cari berada di luar jangkauan kompas takdir booth.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--SGECoralAqua)] to-[var(--SGEPacificOcean)] px-6 text-xs font-bold uppercase tracking-wider text-[#081113] shadow-md transition-all hover:brightness-110"
          >
            Kembali ke Booth
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="app-canvas relative flex min-h-screen items-center justify-center p-6 text-foreground selection:bg-[var(--SGECoralAqua)]/30">
      <div className="ambient-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="glass-surface glass-edge relative z-10 w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
          Sistem Terganggu
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
          Terjadi Kesalahan Teknis
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
          Terjadi anomali saat memuat antarmuka. Silakan segarkan halaman atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-5 text-xs font-bold uppercase tracking-wider text-white border border-white/20 transition-all hover:bg-white/15 cursor-pointer"
          >
            Muat Ulang
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--SGECoralAqua)] to-[var(--SGEPacificOcean)] px-5 text-xs font-bold uppercase tracking-wider text-[#081113] shadow-md transition-all hover:brightness-110 cursor-pointer"
          >
            Beranda Booth
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "SGE FILKOM UB 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  if (import.meta.env.MODE === "test") {
    return <>{children}</>;
  }
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </MotionConfig>
    </QueryClientProvider>
  );
}
