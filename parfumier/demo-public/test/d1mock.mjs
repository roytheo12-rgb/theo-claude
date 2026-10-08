// Faux Cloudflare D1 pour les tests : SQLite en mémoire (node:sqlite) avec la même interface (prepare/bind/first/all/run/batch).
import { DatabaseSync } from 'node:sqlite';
export function makeD1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) || null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => { const r = db.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
    _run: () => db.prepare(sql).run(...args),
  });
  return { prepare: (sql) => stmt(sql), batch: async (list) => { list.forEach((s) => s._run()); return []; }, _raw: db };
}
