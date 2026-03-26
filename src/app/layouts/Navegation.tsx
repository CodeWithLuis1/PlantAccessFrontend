import { UserCog, User, UserLock, Building2, Building, PersonStanding, UserPlus, AlignEndHorizontal,MessageCircleQuestion  } from "lucide-react";
import NavLinkComponent from "@/shared/components/NavLinkComponent";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { url: "/visits",     text: "Listado de visitas", icon: <PersonStanding />,     permission: "visits:view" },
  { url: "/report",     text: "Dashboard",          icon: <AlignEndHorizontal />, permission: "reports:view" },
  { url: "/user",       text: "Usuarios",           icon: <User />,               permission: "users:view" },
  { url: "/role",       text: "Roles",              icon: <UserCog />,            permission: "roles:view" },
  { url: "/agent",      text: "Agentes",            icon: <UserLock />,           permission: "agents:view" },
  { url: "/company",    text: "Empresas",           icon: <Building2 />,          permission: "companies:view" },
  { url: "/department", text: "Departamento",       icon: <Building />,           permission: "departments:view" },
  { url: "/people",     text: "Visitantes",         icon: <UserPlus />,           permission: "people:view" },
  { url: "/help",       text: "¿Necesitás ayuda?",  icon: <MessageCircleQuestion />, public: true },
];

export default function Navegation() {
  const { permissions } = useAuth();

  const visibleItems = NAV_ITEMS.filter(item => item.public || permissions.includes(item.permission!));

  return (
    <div className="space-y-1.5">
      {visibleItems.map(item => (
        <NavLinkComponent key={item.url} url={item.url} text={item.text}>
          {item.icon}
        </NavLinkComponent>
      ))}
    </div>
  );
}
