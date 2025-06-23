from flask import Flask, render_template, request
import sqlite3
from datetime import datetime

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
        selected_metric = request.form.get("metric")
        station_start = request.form.get("station_start")
        station_end = request.form.get("station_end")
        start_date = request.form.get("start_date")
        end_date = request.form.get("end_date")

        print("📌 Filter values:", selected_metric, station_start, station_end, start_date, end_date)

        # Convert ISO (yyyy-mm-dd) to d/m/yyyy for database format
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

# --------------------- LEVEL 3 ---------------------
@app.route('/level3')
def level3():
    conn = sqlite3.connect('climate.db')
    cur = conn.cursor()
    cur.execute("SELECT year, temperature, rainfall FROM climate_graph_data ORDER BY year")
    data = cur.fetchall()
    conn.close()

    years = [row[0] for row in data]
    temperatures = [row[1] for row in data]
    rainfalls = [row[2] for row in data]

    return render_template("level3.html", years=years, temperatures=temperatures, rainfalls=rainfalls)

# --------------------- MAIN ---------------------
if __name__ == '__main__':
    app.run(debug=True)