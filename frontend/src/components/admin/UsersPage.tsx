import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_LABELS, ROLE_OPTIONS, type User, type UserRole } from "../../auth/types";

interface DraftUser {
  username: string;
  full_name: string;
  role: UserRole;
  password: string;
}

const EMPTY_DRAFT: DraftUser = { username: "", full_name: "", role: "doctor", password: "" };

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftUser>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [resetPwd, setResetPwd] = useState("");

  const load = () => {
    setLoading(true);
    api
      .listUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await api.createUser({
        username: draft.username.trim(),
        full_name: draft.full_name.trim(),
        role: draft.role,
        password: draft.password,
      });
      setDraft(EMPTY_DRAFT);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать пользователя");
    } finally {
      setCreating(false);
    }
  };

  const changeRole = async (u: User, role: UserRole) => {
    await api.updateUser(u.id, { role });
    load();
  };

  const toggleActive = async (u: User) => {
    await api.updateUser(u.id, { is_active: !u.is_active });
    load();
  };

  const submitReset = async (u: User) => {
    if (!resetPwd) return;
    await api.updateUser(u.id, { password: resetPwd });
    setResetFor(null);
    setResetPwd("");
  };

  const remove = async (u: User) => {
    if (!window.confirm(`Удалить пользователя «${u.full_name}»?`)) return;
    try {
      await api.deleteUser(u.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  return (
    <div className="users-page">
      <div className="users-page__header">
        <h1>Пользователи</h1>
        <p>Управление учётными записями и ролями доступа</p>
      </div>

      {error && <div className="users-error">{error}</div>}

      <form className="user-create" onSubmit={handleCreate}>
        <h2>Новый пользователь</h2>
        <div className="user-create__grid">
          <label>
            <span>Логин</span>
            <input
              value={draft.username}
              onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              placeholder="например, ivanov"
              required
            />
          </label>
          <label>
            <span>Ф.И.О.</span>
            <input
              value={draft.full_name}
              onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
              placeholder="Фамилия Имя Отчество"
              required
            />
          </label>
          <label>
            <span>Роль</span>
            <select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Пароль</span>
            <input
              type="text"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              placeholder="мин. 4 символа"
              required
            />
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? "Создание…" : "Добавить пользователя"}
        </button>
      </form>

      <div className="users-table-wrap">
        {loading ? (
          <div className="users-loading">Загрузка…</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Ф.И.О.</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.is_active ? "" : "is-inactive"}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as UserRole)}
                      disabled={u.id === currentUser?.id}
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? "badge--ok" : "badge--off"}`}>
                      {u.is_active ? "Активен" : "Отключён"}
                    </span>
                  </td>
                  <td className="users-actions">
                    {resetFor === u.id ? (
                      <span className="reset-inline">
                        <input
                          type="text"
                          value={resetPwd}
                          onChange={(e) => setResetPwd(e.target.value)}
                          placeholder="новый пароль"
                        />
                        <button type="button" className="link-btn" onClick={() => submitReset(u)}>
                          OK
                        </button>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => {
                            setResetFor(null);
                            setResetPwd("");
                          }}
                        >
                          Отмена
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => {
                            setResetFor(u.id);
                            setResetPwd("");
                          }}
                        >
                          Сбросить пароль
                        </button>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => toggleActive(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          {u.is_active ? "Отключить" : "Включить"}
                        </button>
                        <button
                          type="button"
                          className="link-btn link-btn--danger"
                          onClick={() => remove(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="users-hint">
        Роли: <strong>{ROLE_LABELS.admin}</strong> — полный доступ и управление пользователями;{" "}
        <strong>{ROLE_LABELS.doctor}</strong> — пациенты и медкарты;{" "}
        <strong>{ROLE_LABELS.nurse}</strong> — расписание, регистратура, печать (без редактирования
        медкарт).
      </p>
    </div>
  );
}
