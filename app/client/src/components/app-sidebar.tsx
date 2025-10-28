import { Home, Package, ChefHat, Target, BarChart3, TrendingUp, PenTool, Brain, Plug, Sparkles, DollarSign, FileSpreadsheet, BookOpen, Truck, CreditCard, Mail, Rocket } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items for restaurant management
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Pricing",
    url: "/pricing",
    icon: CreditCard,
  },
  {
    title: "Landing Page",
    url: "/landing",
    icon: Rocket,
  },
  {
    title: "Contact / Demo",
    url: "/contact",
    icon: Mail,
  },
  {
    title: "Inventory Entry",
    url: "/inventory-entry",
    icon: PenTool,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Par Levels",
    url: "/par-levels",
    icon: Brain,
  },
  {
    title: "POS Integrations",
    url: "/pos-integrations",
    icon: Plug,
  },
  {
    title: "POS Setup Guide",
    url: "/pos-setup-guide",
    icon: BookOpen,
  },
  {
    title: "Truck Ordering",
    url: "/truck-ordering",
    icon: Truck,
  },
  {
    title: "Recipes",
    url: "/recipes",
    icon: ChefHat,
  },
  {
    title: "Targets",
    url: "/targets",
    icon: Target,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Variance",
    url: "/variance",
    icon: TrendingUp,
  },
  {
    title: "Algorithms",
    url: "/algorithms",
    icon: Sparkles,
  },
  {
    title: "P&L Dashboard",
    url: "/pl-dashboard",
    icon: DollarSign,
  },
  {
    title: "Comprehensive P&L",
    url: "/comprehensive-pl",
    icon: FileSpreadsheet,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Restaurant Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}