import { useState, type FormEvent } from 'react';
import { signInAdmin, signOutAdmin } from '../lib/db';

interface AdminLoginPageProps {
  hasSession: boolean;
  error?: string | null;
  onLoginSuccess: () => void;
}

export function AdminLoginPage({
  hasSession,
  error,
  onLoginSuccess,
}: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Введите почту и пароль администратора.');
      return;
    }

    setSubmitting(true);
    const result = await signInAdmin(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.error || 'Не удалось войти.');
      return;
    }

    onLoginSuccess();
  };

  const handleSignOut = async () => {
    setLocalError(null);
    setSubmitting(true);
    const result = await signOutAdmin();
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.error || 'Не удалось выйти.');
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">
            Администрирование
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Вход в админ-меню
          </h1>
          <p className="text-sm text-slate-500">
            Доступен только пользователям из списка администраторов.
          </p>
        </div>

        {(error || localError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {localError || error}
          </div>
        )}

        {hasSession && !error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            У вас уже есть сессия, но нет доступа к админ-панели. Выйдите и войдите
            под учетной записью администратора.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Почта администратора
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={submitting}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={submitting}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            disabled={submitting}
          >
            {submitting ? 'Проверяем доступ…' : 'Войти'}
          </button>
        </form>

        {hasSession && (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Выйти из текущей сессии
          </button>
        )}
      </div>
    </div>
  );
}
