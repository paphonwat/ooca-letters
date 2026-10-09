import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, LogOut, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';

interface AdminLetter {
  id: string;
  text: string;
  author: string;
  fontSize: number | null;
  hasDrawing: boolean;
}

interface Draft {
  id?: string;
  text: string;
  author: string;
  fontSize: string;
}

const apiUrl = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/admin`;
const emptyDraft: Draft = { text: '', author: '', fontSize: '22' };
const displayAuthor = (author: string) => !author || author === 'Unknow' ? 'บุคคลนิรนาม' : author;

export function AdminView() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [letters, setLetters] = useState<AdminLetter[]>([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadLetters = async () => {
    const response = await fetch(`${apiUrl}/letters`, { credentials: 'include' });
    if (response.status === 401) {
      setIsAuthenticated(false);
      throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error('Could not load letters.');
    setLetters((await response.json()) as AdminLetter[]);
  };

  useEffect(() => {
    fetch(`${apiUrl}/session`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return;
        setIsAuthenticated(true);
        await loadLetters();
      })
      .catch(() => setError('Could not connect to the admin API.'))
      .finally(() => setIsChecking(false));
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(response.status === 503 ? 'Admin password is not configured on the API.' : 'Incorrect password.');
      setPassword('');
      setIsAuthenticated(true);
      await loadLetters();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed.');
    }
  };

  const saveLetter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/letters${draft.id ? `/${encodeURIComponent(draft.id)}` : ''}`, {
        method: draft.id ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: draft.text,
          author: draft.author,
          fontSize: Number(draft.fontSize),
        }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Session expired. Please sign in again.' : 'Could not save this letter.');
      setDraft(null);
      await loadLetters();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this letter.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLetter = async (letter: AdminLetter) => {
    if (!window.confirm(`Delete this letter by ${displayAuthor(letter.author)}?`)) return;
    setError('');
    try {
      const response = await fetch(`${apiUrl}/letters/${encodeURIComponent(letter.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Could not delete this letter.');
      await loadLetters();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this letter.');
    }
  };

  const logout = async () => {
    await fetch(`${apiUrl}/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    setLetters([]);
    setDraft(null);
  };

  const filteredLetters = letters.filter((letter) =>
    `${letter.text} ${letter.author}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft size={17} aria-hidden="true" />
          กลับหน้าเว็บ
        </a>
        <h1 className="text-lg font-semibold">จัดการจดหมาย</h1>
        {isAuthenticated ? (
          <button type="button" onClick={() => void logout()} aria-label="ออกจากระบบ" title="ออกจากระบบ" className="rounded p-2 text-slate-600 hover:bg-slate-100">
            <LogOut size={18} />
          </button>
        ) : <span className="w-9" />}
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {isChecking ? <p role="status" className="text-sm text-slate-500">กำลังตรวจสอบสิทธิ์...</p> : null}

        {!isChecking && !isAuthenticated ? (
          <form onSubmit={login} className="mx-auto mt-16 max-w-sm border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">เข้าสู่ระบบผู้ดูแล</h2>
            <label htmlFor="admin-password" className="mt-6 block text-sm font-medium">รหัสผ่าน</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
            />
            <button type="submit" className="mt-4 w-full rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">เข้าสู่ระบบ</button>
          </form>
        ) : null}

        {isAuthenticated ? (
          <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm text-slate-500">ทั้งหมด {letters.length} รายการ</p>
                <h2 className="mt-1 text-2xl font-semibold">จดหมาย</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ค้นหาข้อความหรือชื่อ"
                    aria-label="ค้นหาจดหมาย"
                    className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm sm:w-64"
                  />
                </label>
                <button type="button" onClick={() => { setError(''); setDraft({ ...emptyDraft }); }} className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                  <Plus size={17} /> เพิ่มจดหมาย
                </button>
              </div>
            </div>

            {draft ? (
              <form onSubmit={saveLetter} className="mt-6 border border-slate-200 bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{draft.id ? 'แก้ไขจดหมาย' : 'เพิ่มจดหมาย'}</h3>
                  <button type="button" onClick={() => setDraft(null)} aria-label="ยกเลิก" title="ยกเลิก" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
                </div>
                <label htmlFor="letter-text" className="mt-4 block text-sm font-medium">ข้อความ</label>
                <textarea id="letter-text" value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} maxLength={140} required rows={3} className="mt-1 w-full resize-y rounded border border-slate-300 p-3 text-sm leading-6" />
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_10rem]">
                  <label className="text-sm font-medium">ชื่อผู้เขียน
                    <input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} maxLength={24} placeholder="บุคคลนิรนาม" className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 font-normal" />
                  </label>
                  <label className="text-sm font-medium">ขนาดตัวอักษร
                    <select value={draft.fontSize} onChange={(event) => setDraft({ ...draft, fontSize: event.target.value })} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal">
                      {[14, 16, 22, 30].map((size) => <option key={size} value={size}>{size}px</option>)}
                    </select>
                  </label>
                </div>
                <button disabled={isSaving} type="submit" className="mt-4 inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <Save size={16} /> {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </form>
            ) : null}

            <div className="mt-6 overflow-x-auto border border-slate-200 bg-white">
              <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3 font-semibold">ข้อความ</th><th className="px-4 py-3 font-semibold">ผู้เขียน</th><th className="px-4 py-3 font-semibold">รูปแบบ</th><th className="w-24 px-4 py-3 text-right font-semibold">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLetters.map((letter) => (
                    <tr key={letter.id} className="align-top hover:bg-slate-50">
                      <td className="max-w-2xl whitespace-pre-line px-4 py-3">{letter.text}</td>
                      <td className="whitespace-nowrap px-4 py-3">{displayAuthor(letter.author)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{letter.hasDrawing ? 'มีภาพวาด' : 'ข้อความ'}{letter.fontSize ? ` · ${letter.fontSize}px` : ''}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <button type="button" onClick={() => { setError(''); setDraft({ id: letter.id, text: letter.text, author: letter.author === 'Unknow' ? '' : letter.author, fontSize: String(letter.fontSize ?? 22) }); }} aria-label="แก้ไข" title="แก้ไข" className="rounded p-2 text-slate-600 hover:bg-slate-200"><Pencil size={16} /></button>
                        <button type="button" onClick={() => void deleteLetter(letter)} aria-label="ลบ" title="ลบ" className="rounded p-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredLetters.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">ไม่พบจดหมาย</td></tr> : null}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}