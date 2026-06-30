import { LogoIcon, NavIcon } from "../icons";
import type { AppNavId } from "../../App";
import type { UserRole } from "../../auth/types";

type NavItem = { id: AppNavId | string; label: string; icon: string; nav?: AppNavId };

const MAIN_NAV: NavItem[] = [
  { id: "schedule", label: "Расписание", icon: "schedule", nav: "schedule" },
  { id: "waiting", label: "Лист ожидания", icon: "waiting" },
  { id: "admin", label: "Панель администратора", icon: "admin" },
  { id: "crm", label: "CRM", icon: "crm" },
  { id: "procedure", label: "Процедурный кабинет", icon: "procedure" },
  { id: "work", label: "График работ", icon: "work" },
];

const REGISTRY_NAV: NavItem[] = [
  { id: "appointments", label: "Приемы", icon: "appointments" },
  { id: "patients", label: "Пациенты", icon: "patients", nav: "patients" },
  { id: "specialists", label: "Специалисты", icon: "specialists" },
];

const REPORT_NAV: NavItem[] = [
  { id: "accounting", label: "Учет", icon: "accounting" },
  { id: "reports", label: "Отчеты", icon: "reports" },
];

const ADMIN_NAV: NavItem[] = [
  { id: "users", label: "Пользователи", icon: "admin", nav: "users" },
];

interface SidebarProps {
  activeNav: AppNavId;
  role?: UserRole;
  onNavigate: (navId: AppNavId) => void;
}

function NavSection({
  title,
  items,
  activeNav,
  onNavigate,
}: {
  title?: string;
  items: NavItem[];
  activeNav: AppNavId;
  onNavigate: (navId: AppNavId) => void;
}) {
  return (
    <div className="sidebar__section">
      {title && <div className="sidebar__section-title">{title}</div>}
      <ul className="sidebar__list">
        {items.map((item) => {
          const isActive = item.nav !== undefined && activeNav === item.nav;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                onClick={() => {
                  if (item.nav) onNavigate(item.nav);
                }}
              >
                <span className="sidebar__link-icon">
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({ activeNav, role, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <LogoIcon />
        <span className="sidebar__brand-text">MedStory</span>
      </div>
      <nav className="sidebar__nav">
        <NavSection items={MAIN_NAV} activeNav={activeNav} onNavigate={onNavigate} />
        <NavSection
          title="Реестр"
          items={REGISTRY_NAV}
          activeNav={activeNav}
          onNavigate={onNavigate}
        />
        <NavSection title="Отчетность" items={REPORT_NAV} activeNav={activeNav} onNavigate={onNavigate} />
        {role === "admin" && (
          <NavSection
            title="Администрирование"
            items={ADMIN_NAV}
            activeNav={activeNav}
            onNavigate={onNavigate}
          />
        )}
      </nav>
    </aside>
  );
}
