import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "~/components/layout/app-layout";
import { ThemeProvider } from "~/components/layout/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ThemeProvider>
  ),
});
