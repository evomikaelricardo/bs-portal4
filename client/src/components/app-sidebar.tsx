import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown, ChevronRight, Users, UserCog, Phone, MessageSquare, ClipboardList, Building2, UserPlus, ArrowDownToLine, ArrowUpFromLine, MapPin } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocationContext, type LocationType } from "@/context/LocationContext";
import logoImage from "@assets/BrightstarlogoTransparent_1762830616887.png";

interface NavItem {
  title: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigationStructure: NavItem[] = [
  {
    title: "Customers",
    icon: Users,
    children: [
      {
        title: "Call",
        icon: Phone,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/call/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/call/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/call/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/call/recruitment/outbound" },
            ],
          },
        ],
      },
      {
        title: "Text",
        icon: MessageSquare,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/text/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/text/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/text/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/text/recruitment/outbound" },
            ],
          },
        ],
      },
      {
        title: "Form",
        icon: ClipboardList,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/form/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/form/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/customers/form/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/customers/form/recruitment/outbound" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Staffs",
    icon: UserCog,
    children: [
      {
        title: "Call",
        icon: Phone,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/call/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/call/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/call/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/call/recruitment/outbound" },
            ],
          },
        ],
      },
      {
        title: "Text",
        icon: MessageSquare,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/text/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/text/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/text/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/text/recruitment/outbound" },
            ],
          },
        ],
      },
      {
        title: "Form",
        icon: ClipboardList,
        children: [
          {
            title: "Helpdesk",
            icon: Building2,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/form/cs/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/form/cs/outbound" },
            ],
          },
          {
            title: "Recruitment",
            icon: UserPlus,
            children: [
              { title: "Inbound", icon: ArrowDownToLine, path: "/staffs/form/recruitment/inbound" },
              { title: "Outbound", icon: ArrowUpFromLine, path: "/staffs/form/recruitment/outbound" },
            ],
          },
        ],
      },
    ],
  },
];

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const [location, setLocation] = useLocation();
  const { location: currentLocation } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const fullPath = item.path ? `/${currentLocation}${item.path}` : undefined;
  const isActive = fullPath ? location === fullPath : false;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            data-testid={`nav-${item.title.toLowerCase()}`}
            className="w-full justify-between"
            style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4" />}
              <span>{item.title}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu>
            {item.children?.map((child) => (
              <SidebarMenuItem key={child.title}>
                <NavItemComponent item={child} level={level + 1} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      data-testid={`nav-link-${item.title.toLowerCase()}`}
      style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
    >
      <a href={fullPath} onClick={(e) => {
        e.preventDefault();
        if (fullPath) {
          setLocation(fullPath);
        }
      }}>
        {Icon && <Icon className="w-4 h-4" />}
        <span>{item.title}</span>
      </a>
    </SidebarMenuButton>
  );
}

export function AppSidebar() {
  const { location, setLocation } = useLocationContext();

  const locationLabel = location.charAt(0).toUpperCase() + location.slice(1);

  return (
    <Sidebar>
      <div className="p-4 border-b flex items-center justify-center">
        <img 
          src={logoImage} 
          alt="BrightStar Care Logo" 
          className="h-10 w-auto"
          data-testid="img-sidebar-logo"
        />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 pb-2">
              <Select value={location} onValueChange={(value) => setLocation(value as LocationType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baltimore">Baltimore</SelectItem>
                  <SelectItem value="pittsburgh">Pittsburgh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationStructure.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavItemComponent item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
