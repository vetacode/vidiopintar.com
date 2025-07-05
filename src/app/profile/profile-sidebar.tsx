"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  Settings, 
  MessageSquare, 
  Share2, 
  Palette, 
  Bell 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/profile/chat",
    label: "Chats",
    icon: MessageSquare,
  },
  {
    href: "/profile/shared",
    label: "Shared",
    icon: Share2,
  },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 pr-8">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}