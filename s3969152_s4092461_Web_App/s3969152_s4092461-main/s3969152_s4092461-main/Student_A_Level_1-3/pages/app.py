from flask import Flask, render_template, request
import sqlite3
from datetime import datetime

app = Flask(__name__)

# ---- Level 1: Home page with chart ----
@app.route('/')
def home():
    conn = sqlite3.connect('climate.db')
    cur = conn.cursor()
    cur.execute("SELECT year, temperature, rainfall FROM climate_graph_data")
    data = cur.fetchall()
    conn.close()

    years = [row[0] for row in data]
    temperatures = [row[1] for row in data]
    rainfalls = [row[2] for row in data]

    return render_template("home.html", years=years, temperatures=temperatures, rainfalls=rainfalls)

# ---- Level 2: Climate Metric Viewer ----
@app.route('/level2', methods=['GET', 'POST'])
def level2_page():
    results = []
    if request.method == 'POST':
        selected_metric = request.form.get("metric")
        station_start = request.form.get("station_start")
        station_end = request.form.get("station_end")
        start_date = request.form.get("start_date")
        end_date = request.form.get("end_date")

        print("📌 Filter values:", selected_metric, station_start, station_end, start_date, end_date)

        # Convert ISO date (browser) to DB format: d/mm/yyyy (Windows-friendly)
        start_date = datetime.strptime(start_date, '%Y-%m-%d').strftime('%#d/%m/%Y')
        end_date = datetime.strptime(end_date, '%Y-%m-%d').strftime('%#d/%m/%Y')

        conn = sqlite3.connect('climate.db')
        cur = conn.cursor()
        query = f"""
            SELECT station_id, date, {selected_metric}
            FROM weather_data
            WHERE station_id BETWEEN ? AND ?
              AND date BETWEEN ? AND ?
              AND {selected_metric} IS NOT NULL
            ORDER BY station_id, date
        """
        try:
            cur.execute(query, (station_start, station_end, start_date, end_date))
            results = cur.fetchall()
            print("✅ Results returned:", results)
        except sqlite3.Error as e:
            print("❌ SQL Error:", e)
        conn.close()

    return render_template("level2.html", results=results)

if __name__ == '__main__':
    app.run(debug=True)

# --- Level 2 logic ---
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

# --- Level 3 logic ---
from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

# --------------------- LEVEL 1 ---------------------
@app.route('/')
def home():
    conn = sqlite3.connect('climate.db')
    cur = conn.cursor()
    cur.execute("SELECT year, temperature, rainfall FROM climate_graph_data")
    data = cur.fetchall()
    conn.close()

    years = [row[0] for row in data]
    temperatures = [row[1] for row in data]
    rainfalls = [row[2] for row in data]

    return render_template("home.html", years=years, temperatures=temperatures, rainfalls=rainfalls)


# --------------------- LEVEL 2 ---------------------
@app.route('/level2', methods=['GET', 'POST'])
def level2():
    results = []
    if request.method == 'POST':
        metric = request.form.get("metric")
        station_start = request.form.get("station_start")
        station_end = request.form.get("station_end")
        start_date = request.form.get("start_date")
        end_date = request.form.get("end_date")

        conn = sqlite3.connect('climate.db')
        cur = conn.cursor()

        query = f"""
            SELECT station_id, date, {metric}
            FROM weather_data
            WHERE station_id BETWEEN ? AND ?
              AND date BETWEEN ? AND ?
              AND {metric} IS NOT NULL
            ORDER BY station_id, date
        """
        try:
            cur.execute(query, (station_start, station_end, start_date, end_date))
            results = cur.fetchall()
        except sqlite3.Error as e:
            print("❌ SQL error:", e)

        conn.close()

    return render_template("level2.html", results=results)


# --------------------- LEVEL 3 ---------------------
@app.route('/level3')
def level3():
    # Hardcoded example data for draft
    years = [2010, 2012, 2014, 2016, 2018, 2020, 2022]
    metric_a = [22.5, 22.7, 23.0, 23.1, 23.3, 23.7, 24.0]
    metric_b = [180, 172, 160, 155, 150, 140, 130]

    return render_template("level3.html", years=years, metric_a=metric_a, metric_b=metric_b)


if __name__ == '__main__':
    app.run(debug=True)