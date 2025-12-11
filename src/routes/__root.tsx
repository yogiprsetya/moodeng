import { lazy, Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "~/components/layout/app-layout";
import { ThemeProvider } from "~/components/layout/theme-provider";

const Toaster = lazy(() =>
  import("~/components/ui/sonner").then((module) => ({
    default: module.Toaster,
  }))
);

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AppLayout>
        <Outlet />

        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  ),
});
