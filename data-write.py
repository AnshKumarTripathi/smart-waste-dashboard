import random
import statistics
import csv
import math
import numpy as np
from scipy.stats import poisson

# Base dataset
base_data = [
    {"Bin ID": 1, "Location": "Market Area A", "Latitude": 23.0225, "Longitude": 72.5714, "Region": "Region 1"},
    {"Bin ID": 2, "Location": "Residential Zone B", "Latitude": 23.03, "Longitude": 72.58, "Region": "Region 1"},
    {"Bin ID": 3, "Location": "Commercial Street C", "Latitude": 23.04, "Longitude": 72.57, "Region": "Region 1"},
    {"Bin ID": 4, "Location": "Park D", "Latitude": 23.05, "Longitude": 72.58, "Region": "Region 1"},
    {"Bin ID": 5, "Location": "Hospital Area E", "Latitude": 23.2, "Longitude": 72.6, "Region": "Region 2"},
    {"Bin ID": 6, "Location": "Industrial Zone F", "Latitude": 23.21, "Longitude": 72.61, "Region": "Region 2"},
    {"Bin ID": 7, "Location": "School Area G", "Latitude": 23.22, "Longitude": 72.6, "Region": "Region 2"},
    {"Bin ID": 8, "Location": "Mall Area H", "Latitude": 23.23, "Longitude": 72.61, "Region": "Region 2"},
    {"Bin ID": 9, "Location": "Downtown I", "Latitude": 22.9, "Longitude": 72.5, "Region": "Region 3"},
    {"Bin ID": 10, "Location": "Uptown J", "Latitude": 22.91, "Longitude": 72.51, "Region": "Region 3"},
    {"Bin ID": 11, "Location": "Suburb K", "Latitude": 22.92, "Longitude": 72.5, "Region": "Region 3"},
    {"Bin ID": 12, "Location": "Rural L", "Latitude": 22.93, "Longitude": 72.51, "Region": "Region 3"},
]

# Add historical fill levels (10 values per location)
synthetic_data = []
for location in base_data:
    historical_fill_levels = []
    for _ in range(10):
        x = random.randint(0, 9)
        pi_multiple = random.randint(0, 3) * math.pi
        if random.choice([True, False]):
            y = x * 10 + pi_multiple
        else:
            y = x * 10 - pi_multiple
        historical_fill_levels.append(y)
    location["Historical Fill Levels"] = historical_fill_levels
    synthetic_data.append(location)

# Calculate final fill value using Poisson distribution
threshold = 70 # change this thing bud to get readl time feed
hotspots = []
for location in synthetic_data:
    historical_fill_levels = location["Historical Fill Levels"]
    mu = statistics.mean(historical_fill_levels)
    final_fill_value = poisson.rvs(mu)
    location["Final Fill Value"] = final_fill_value
    if final_fill_value > threshold:
        hotspots.append(location)

# Write to CSV
with open("hotspot_data.csv", "w", newline="") as csvfile:
    fieldnames = ["Bin ID", "Location", "Latitude", "Longitude", "Region", "Final Fill Value"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for hotspot in hotspots:
        writer.writerow({
            "Bin ID": hotspot["Bin ID"],
            "Location": hotspot["Location"],
            "Latitude": hotspot["Latitude"],
            "Longitude": hotspot["Longitude"],
            "Region": hotspot["Region"],
            "Final Fill Value": hotspot["Final Fill Value"],
        })

print("hotspot_data.csv created successfully.")