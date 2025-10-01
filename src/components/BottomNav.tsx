import React from "react";
import { Home, Library, Music, Bell } from "lucide-react";

export type NavKey = "home" | "library" | "create" | "inbox" | "account";

export interface BottomNavProps {
  active: NavKey;
  onHome?: () => void;
  onLibrary?: () => void;
  onCreate?: () => void;   // big center button
  onInbox?: () => void;
  onAccount?: () => void;
  className?: string;
  badgeCount?: number;     // red dot on Inbox
  accountInitial?: string; // e.g. "S"
}

const BottomNav: React.FC<BottomNavProps> = ({
  active,
  onHome,
  onLibrary,
  onCreate,
  onInbox,
  onAccount,
  className = "",
  badgeCount = 1,
  accountInitial = "S",
}) => {
  const base = "flex flex-col items-center gap-1 py-1";
  const activeTxt = "text-black";
  const inactiveTxt = "text-gray-400";

  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-gray-100 [padding-bottom:env(safe-area-inset-bottom)] z-50 ${className}`}
      role="navigation"
      aria-label="Bottom"
    >
      <div className="px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Home */}
          <button
            className={base}
            onClick={onHome}
            aria-label="Home"
            aria-current={active === "home" ? "page" : undefined}
          >
            <Home className={`w-6 h-6 ${active === "home" ? activeTxt : inactiveTxt}`} />
            <span className={`text-xs font-medium ${active === "home" ? activeTxt : inactiveTxt}`}>
              Home
            </span>
          </button>

          {/* Library */}
          <button
            className={base}
            onClick={onLibrary}
            aria-label="Library"
            aria-current={active === "library" ? "page" : undefined}
          >
            <Library className={`w-6 h-6 ${active === "library" ? activeTxt : inactiveTxt}`} />
            <span className={`text-xs font-medium ${active === "library" ? activeTxt : inactiveTxt}`}>
              Library
            </span>
          </button>

          {/* Create (center) */}
          <button
            className="w-12 h-12 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 -mt-1"
            onClick={onCreate}
            aria-label="Create music"
          >
            <Music className="w-6 h-6 text-white" />
          </button>

          {/* Inbox */}
          <button
            className={`${base} relative`}
            onClick={onInbox}
            aria-label="Inbox"
            aria-current={active === "inbox" ? "page" : undefined}
          >
            <Bell className={`w-6 h-6 ${active === "inbox" ? activeTxt : inactiveTxt}`} />
            {badgeCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500"
              />
            )}
            <span className={`text-xs font-medium ${active === "inbox" ? activeTxt : inactiveTxt}`}>
              Inbox
            </span>
          </button>

          {/* Account */}
          <button
            className={base}
            onClick={onAccount}
            aria-label="Account"
            aria-current={active === "account" ? "page" : undefined}
          >
            <span
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ${
                active === "account" ? "" : ""
              }`}
            >
              {accountInitial}
            </span>
            <span className={`text-xs font-medium ${active === "account" ? activeTxt : inactiveTxt}`}>
              Account
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
