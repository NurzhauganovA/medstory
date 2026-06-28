import { BellIcon, PlusIcon, SearchIcon, SparkleIcon } from "../icons";

interface ScheduleHeaderProps {
  onCreateClick: () => void;
}

export function ScheduleHeader({ onCreateClick }: ScheduleHeaderProps) {
  return (
    <header className="schedule-header">
      <div className="schedule-header__search schedule-header__search--plain">
        <SearchIcon />
        <input type="text" placeholder="Поиск по ИИН или ФИО" />
      </div>
      <div className="schedule-header__search schedule-header__search--smart">
        <SparkleIcon />
        <input type="text" placeholder="Умный поиск (Невролог, Сегодня)" />
      </div>
      <div className="schedule-header__actions">
        <button type="button" className="btn-create" onClick={onCreateClick}>
          <PlusIcon />
          Создать запись
        </button>
        <button type="button" className="btn-bell" aria-label="Уведомления">
          <BellIcon />
        </button>
      </div>
    </header>
  );
}
