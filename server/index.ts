import 'dotenv/config';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import type { NextFunction, Request, Response } from 'express';

interface LetterRow extends RowDataPacket {
  id: string;
  text: string;
  author: string;
  fontSize: number | null;
  drawing: string | null;
}

interface AdminLetterRow extends RowDataPacket {
  id: string;
  text: string;
  author: string;
  fontSize: number | null;
  hasDrawing: boolean;
}

const app = express();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const sessionCookieName = 'mooca_admin';
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const adminSessions = new Map<string, number>();
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'Mooca',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));
app.use(express.json({ limit: '12mb' }));
app.use(cookieParser());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/health/database', async (_request, response) => {
  try {
    const [rows] = await pool.query<(RowDataPacket & { count: number })[]>(
      'SELECT COUNT(*) AS count FROM letters',
    );
    response.json({ status: 'ok', letterCount: Number(rows[0]?.count ?? 0) });
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
        ? error.code
        : 'UNKNOWN';
    console.error('Database health check failed:', code);
    response.status(503).json({ status: 'unavailable', code });
  }
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' as const : 'lax' as const,
  path: '/api/admin',
  maxAge: sessionLifetimeMs,
});

const requireAdmin = (request: Request, response: Response, next: NextFunction) => {
  const token = request.cookies?.[sessionCookieName];
  const expiresAt = typeof token === 'string' ? adminSessions.get(token) : undefined;
  if (!expiresAt || expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    response.status(401).json({ error: 'Admin login required' });
    return;
  }
  next();
};

app.post('/api/admin/login', loginRateLimit, (request, response) => {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const submittedPassword = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!configuredPassword) {
    response.status(503).json({ error: 'Admin password is not configured' });
    return;
  }

  const expected = createHash('sha256').update(configuredPassword).digest();
  const submitted = createHash('sha256').update(submittedPassword).digest();
  if (!timingSafeEqual(expected, submitted)) {
    response.status(401).json({ error: 'Invalid password' });
    return;
  }

  const token = randomUUID();
  adminSessions.set(token, Date.now() + sessionLifetimeMs);
  response.cookie(sessionCookieName, token, cookieOptions()).json({ authenticated: true });
});

app.get('/api/admin/session', requireAdmin, (_request, response) => {
  response.json({ authenticated: true });
});

app.post('/api/admin/logout', requireAdmin, (request, response) => {
  const token = request.cookies?.[sessionCookieName];
  if (typeof token === 'string') adminSessions.delete(token);
  response.clearCookie(sessionCookieName, cookieOptions()).status(204).end();
});

app.get('/api/admin/letters', requireAdmin, async (_request, response) => {
  try {
    const [rows] = await pool.query<AdminLetterRow[]>(
      'SELECT id, text, author, font_size AS fontSize, (drawing IS NOT NULL) AS hasDrawing FROM letters ORDER BY created_at DESC LIMIT 500',
    );
    response.json(rows);
  } catch (error) {
    console.error('Could not load admin letters:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.post('/api/admin/letters', requireAdmin, async (request, response) => {
  const { text, author, fontSize } = request.body ?? {};
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  const normalizedAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'บุคคลนิรนาม';
  const normalizedFontSize = Number.isInteger(fontSize) && fontSize >= 8 && fontSize <= 48 ? fontSize : null;
  if (!normalizedText || normalizedText.length > 140 || normalizedAuthor.length > 24) {
    response.status(400).json({ error: 'Invalid letter' });
    return;
  }

  const id = randomUUID();
  try {
    await pool.execute(
      'INSERT INTO letters (id, text, author, font_size) VALUES (?, ?, ?, ?)',
      [id, normalizedText, normalizedAuthor, normalizedFontSize],
    );
    response.status(201).json({ id, text: normalizedText, author: normalizedAuthor, fontSize: normalizedFontSize ?? undefined });
  } catch (error) {
    console.error('Could not create admin letter:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.put('/api/admin/letters/:id', requireAdmin, async (request, response) => {
  const { text, author, fontSize } = request.body ?? {};
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  const normalizedAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'บุคคลนิรนาม';
  const normalizedFontSize = Number.isInteger(fontSize) && fontSize >= 8 && fontSize <= 48 ? fontSize : null;
  if (!normalizedText || normalizedText.length > 140 || normalizedAuthor.length > 24) {
    response.status(400).json({ error: 'Invalid letter' });
    return;
  }

  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      'UPDATE letters SET text = ?, author = ?, font_size = ? WHERE id = ?',
      [normalizedText, normalizedAuthor, normalizedFontSize, request.params.id],
    );
    if (result.affectedRows === 0) {
      response.status(404).json({ error: 'Letter not found' });
      return;
    }
    response.json({ id: request.params.id, text: normalizedText, author: normalizedAuthor, fontSize: normalizedFontSize ?? undefined });
  } catch (error) {
    console.error('Could not update admin letter:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.delete('/api/admin/letters/:id', requireAdmin, async (request, response) => {
  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>('DELETE FROM letters WHERE id = ?', [request.params.id]);
    if (result.affectedRows === 0) {
      response.status(404).json({ error: 'Letter not found' });
      return;
    }
    response.status(204).end();
  } catch (error) {
    console.error('Could not delete admin letter:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.get('/api/letters', async (_request, response) => {
  try {
    const [rows] = await pool.query<LetterRow[]>(
      'SELECT id, text, author, font_size AS fontSize, drawing FROM letters ORDER BY created_at DESC',
    );
    response.json(rows);
  } catch (error) {
    console.error('Could not load letters:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.post('/api/letters', async (request, response) => {
  const { text, author, fontSize, drawing } = request.body ?? {};
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  const normalizedAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'บุคคลนิรนาม';
  const normalizedDrawing = typeof drawing === 'string' && drawing.length > 0 ? drawing : null;
  const normalizedFontSize = Number.isInteger(fontSize) && fontSize >= 8 && fontSize <= 48 ? fontSize : null;

  if ((!normalizedText && !normalizedDrawing) || normalizedText.length > 140 || normalizedAuthor.length > 24) {
    response.status(400).json({ error: 'Invalid letter' });
    return;
  }

  const id = randomUUID();
  try {
    await pool.execute(
      'INSERT INTO letters (id, text, author, font_size, drawing) VALUES (?, ?, ?, ?, ?)',
      [id, normalizedText, normalizedAuthor, normalizedFontSize, normalizedDrawing],
    );
    response.status(201).json({
      id,
      text: normalizedText,
      author: normalizedAuthor,
      fontSize: normalizedFontSize ?? undefined,
      drawing: normalizedDrawing ?? undefined,
    });
  } catch (error) {
    console.error('Could not save letter:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
});

app.listen(port, () => {
  console.log(`Mooca API listening on http://localhost:${port}`);
});