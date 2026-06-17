export function IconSidebar() {
  return (
    <aside className="icon-sidebar">
      <button type="button" className="icon-sidebar__btn icon-sidebar__btn--active" aria-label="Расписание">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      <button type="button" className="icon-sidebar__btn" aria-label="Документы">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </button>
      <button type="button" className="icon-sidebar__btn" aria-label="Аналитика">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </button>
    </aside>
  );
}

export function TopHeader() {
  return (
    <header className="top-header">
      <nav className="breadcrumbs">
        Расписание / <span className="breadcrumbs__active">Запись</span>
      </nav>
      <div className="top-header__actions">
        <button type="button" className="header-icon-btn" aria-label="Сообщения">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v12H5.17L4 17.17V4z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </button>
        <button type="button" className="header-icon-btn" aria-label="Уведомления">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className="user-profile">
          <div className="user-profile__avatar" />
          <div>
            <div className="user-profile__name">Ашимова Д.Н.</div>
            <div className="user-profile__role">Главный врач</div>
          </div>
        </div>
      </div>
    </header>
  );
}
