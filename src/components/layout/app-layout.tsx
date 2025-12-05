import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Topbar } from "~/components/layout/topbar";
import { SidebarContent as NotesSidebarContent } from "~/components/layout/sidebar-content";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Topbar />

        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader>
              <SidebarTrigger />
            </SidebarHeader>

            <NotesSidebarContent />
            <SidebarRail />
          </Sidebar>

          <SidebarInset className="flex flex-col">
            <main className="flex flex-1 flex-col overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
