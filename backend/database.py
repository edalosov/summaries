import sqlite3
import json
import os
from flask import g

DATABASE = os.path.join(os.path.dirname(__file__), 'summaries.db')
MAX_HISTORY = 20


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    with app.app_context():
        db = sqlite3.connect(DATABASE)
        db.execute('''
            CREATE TABLE IF NOT EXISTS summaries (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                input_text    TEXT    NOT NULL,
                input_preview TEXT    NOT NULL,
                content_type  TEXT    NOT NULL DEFAULT 'general',
                summary_json  TEXT    NOT NULL,
                created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
            )
        ''')
        db.commit()
        db.close()
    app.teardown_appcontext(close_db)


def save_summary(input_text, content_type, summary_dict):
    db = get_db()
    input_preview = input_text[:120].replace('\n', ' ')
    summary_json = json.dumps(summary_dict)

    cursor = db.execute(
        'INSERT INTO summaries (input_text, input_preview, content_type, summary_json) VALUES (?, ?, ?, ?)',
        (input_text, input_preview, content_type, summary_json)
    )
    db.commit()
    new_id = cursor.lastrowid

    # Prune to keep only the last MAX_HISTORY entries
    db.execute(
        'DELETE FROM summaries WHERE id NOT IN (SELECT id FROM summaries ORDER BY id DESC LIMIT ?)',
        (MAX_HISTORY,)
    )
    db.commit()

    row = db.execute('SELECT * FROM summaries WHERE id = ?', (new_id,)).fetchone()
    return dict(row)


def get_history():
    db = get_db()
    rows = db.execute(
        'SELECT id, input_preview, content_type, summary_json, created_at FROM summaries ORDER BY id DESC'
    ).fetchall()

    results = []
    for row in rows:
        summary = json.loads(row['summary_json'])
        results.append({
            'id': row['id'],
            'input_preview': row['input_preview'],
            'content_type': row['content_type'],
            'title': summary.get('title', 'Untitled'),
            'created_at': row['created_at'],
        })
    return results


def get_summary(summary_id):
    db = get_db()
    row = db.execute('SELECT * FROM summaries WHERE id = ?', (summary_id,)).fetchone()
    if row is None:
        return None
    result = dict(row)
    result['summary'] = json.loads(result.pop('summary_json'))
    return result


def delete_summary(summary_id):
    db = get_db()
    db.execute('DELETE FROM summaries WHERE id = ?', (summary_id,))
    db.commit()
