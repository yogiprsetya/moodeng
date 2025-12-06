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
import type { FC, ReactNode } from "react";

export const AppLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border/50">
            <SidebarTrigger />
          </SidebarHeader>

          <NotesSidebarContent />
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col bg-background">
          <main className="flex flex-1 flex-col overflow-auto">
            <div className="container mx-auto max-w-4xl px-8 py-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </div>
  </SidebarProvider>
);
