import type { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { AchievementsProvider } from "./AchievementsProvider";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AchievementsProvider>
      <div className="min-h-screen">
        <main
          className="mx-auto w-full max-w-md px-5 pb-28 pt-4"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          {children}
        </main>
        <BottomNavigation />
      </div>
    </AchievementsProvider>
  );
}
