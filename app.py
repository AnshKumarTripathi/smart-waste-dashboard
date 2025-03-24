from flask import Flask, render_template
import csv

app = Flask(__name__)

def read_csv_data(filename):
    data = []
    try:
        with open(filename, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            if reader.fieldnames:
                for row in reader:
                    data.append(row)
            else:
                print(f"Warning: CSV file '{filename}' has no headers.")
    except FileNotFoundError:
        print(f"Error: CSV file '{filename}' not found.")
    return data

@app.route('/')
def dashboard():
    bins = read_csv_data('synthetic_data.csv')
    regions = sorted(list(set(bin['Region'] for bin in bins if 'Region' in bin)))
    return render_template('dashboard.html', bins=bins, regions=regions)

@app.route('/hotspots')
def hotspots():
    return render_template('hotspots.html')

if __name__ == '__main__':
    app.run(debug=True)