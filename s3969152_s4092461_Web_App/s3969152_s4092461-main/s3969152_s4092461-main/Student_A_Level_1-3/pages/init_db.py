import sqlite3

conn = sqlite3.connect('climate.db')
cur = conn.cursor()

cur.execute('''
CREATE TABLE IF NOT EXISTS climate_graph_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    temperature REAL,
    rainfall REAL
)
''')

cur.executemany('''
INSERT INTO climate_graph_data (year, temperature, rainfall)
VALUES (?, ?, ?)
''', [
    (2002, 21.5, 300),
    (2006, 22.0, 320),
    (2010, 22.3, 310),
    (2016, 23.1, 290),
    (2019, 23.5, 280),
    (2022, 24.2, 270)
])

conn.commit()
conn.close()
print("✅ climate.db created.")