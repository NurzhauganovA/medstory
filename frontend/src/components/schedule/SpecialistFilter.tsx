import type { Specialist } from "../../types/schedule";
import { SearchIcon } from "../icons";

interface SpecialistFilterProps {
  specialists: Specialist[];
  selectedId: number | null;
  specialtyFilter: string;
  search: string;
  onSelect: (id: number) => void;
  onSpecialtyChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  specialties: string[];
}

export function SpecialistFilter({
  specialists,
  selectedId,
  specialtyFilter,
  search,
  onSelect,
  onSpecialtyChange,
  onSearchChange,
  specialties,
}: SpecialistFilterProps) {
  return (
    <aside className="specialist-filter">
      <h2 className="specialist-filter__title">Фильтр специалистов</h2>

      <select
        className="specialist-filter__select"
        value={specialtyFilter}
        onChange={(e) => onSpecialtyChange(e.target.value)}
      >
        {specialties.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="specialist-filter__search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Поиск специалиста"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="specialist-filter__list">
        {specialists.map((spec) => {
          const active = spec.id === selectedId;
          return (
            <button
              key={spec.id}
              type="button"
              className={`specialist-card ${active ? "specialist-card--active" : ""}`}
              onClick={() => onSelect(spec.id)}
            >
              <div className="specialist-card__top">
                <span className="specialist-card__name">{spec.full_name}</span>
                {spec.room && <span className="specialist-card__room">{spec.room}</span>}
              </div>
              <span className={`specialist-card__badge ${active ? "specialist-card__badge--active" : ""}`}>
                {spec.specialty}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
