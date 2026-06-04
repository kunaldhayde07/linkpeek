import {
  BarChart3,
  Clock,
  Folder,
  Home,
  Key,
  Search,
  Settings,
} from "lucide-react";

// ============================================================================
// Navigation Configuration
// Used by sidebar and mobile navigation components
// ============================================================================

export const dashboardNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Generate previews and view overview",
  },
  {
    title: "History",
    href: "/history",
    icon: Clock,
    description: "View all generated previews",
  },
  {
    title: "Collections",
    href: "/collections",
    icon: Folder,
    description: "Organize previews into groups",
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
    description: "Search your preview history",
  },
  {
    title: "API Keys",
    href: "/api-keys",
    icon: Key,
    description: "Manage your API keys",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View usage statistics",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account and preferences",
  },
] as const;
