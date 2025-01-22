import datetime
import random
import json
import pytz
from collections import defaultdict

# Set the Asia/Kolkata timezone
kolkata_tz = pytz.timezone('Asia/Kolkata')

# Generate hourly historical data (6 AM to 6 PM)
# Generate hourly historical data (6 AM to 6 PM)
def generate_historical_data(start_date, end_date, smb_count):
    data = []
    current_date = start_date
    delta = datetime.timedelta(hours=1)  # Hourly frequency
    
    smb_ids = [f"{i:d}" for i in range(1, smb_count + 1)]
    
    while current_date <= end_date:
        # Convert current_date to Asia/Kolkata timezone
        current_date_kolkata = kolkata_tz.localize(current_date)
        
        # Include only data between 6 AM and 6 PM in Asia/Kolkata time
        if 6 <= current_date_kolkata.hour < 18:
            for smb_id in smb_ids:
                record = {
                    "timestamp": current_date_kolkata.strftime('%Y-%m-%d %I:%M:%S %p'),  # 12-hour format with AM/PM
                    "smb_id": smb_id,
                    "energy_kwh": round(random.uniform(10.0, 100.0), 2),
                    "current": round(random.uniform(10.0, 20.0), 2),
                    "voltage": round(random.uniform(220.0, 240.0), 2),
                    "temperature": round(random.uniform(20.0, 50.0), 2)
                }
                data.append(record)
        current_date += delta
    
    return data

# Aggregation function
def aggregate_data(data, frequency):
    aggregated = defaultdict(lambda: defaultdict(list))

    for record in data:
        smb_id = record["smb_id"]
        timestamp = datetime.datetime.strptime(record["timestamp"], '%Y-%m-%d %I:%M:%S %p')

        # Convert the timestamp to Asia/Kolkata time zone
        timestamp_kolkata = timestamp.astimezone(kolkata_tz)

        # Key generation based on frequency
        if frequency == "daily":
            key = timestamp_kolkata.date().isoformat()  # e.g., '2025-01-01'
            time_key = timestamp_kolkata.strftime("%I%p").lstrip('0')  # Hour in 12-hour format (AM/PM)
        elif frequency == "weekly":
            # Week number is determined by the year and week number, but we will break it down into days
            key = f"{timestamp_kolkata.year}-W{timestamp_kolkata.isocalendar()[1]}"  # Year and ISO week number
            # Map the day of the week to full names (e.g., Monday, Tuesday, etc.)
            time_key = timestamp_kolkata.strftime("%A")  # Full day name (Monday, Tuesday, etc.)
        elif frequency == "monthly":
            key = f"{timestamp_kolkata.year}-{timestamp_kolkata.month:02d}"  # Year and Month (e.g., '2025-01')
            time_key = timestamp_kolkata.strftime("%B")  # Month name (January, February, etc.)
        elif frequency == "yearly":
            key = str(timestamp_kolkata.year)  # Year as a string (e.g., '2025')
            time_key = "Year"  # For yearly, we can just have one entry for the whole year
        else:
            raise ValueError(f"Unsupported frequency: {frequency}")

        # Group the data by SMB ID and frequency-specific key
        aggregated[smb_id][key].append((time_key, record))

    # Calculate aggregated values for each group
    result = []
    for smb_id, groups in aggregated.items():
        for key, records in groups.items():
            # Aggregate by time (day of the week for weekly, week for weekly, month for monthly, year for yearly)
            aggregated_record = {
                "smb_id": smb_id,
                "key": key,  # Frequency-specific key (e.g., date, week, month, year)
                "data": []
            }

            # Process each time_key (day of the week for weekly)
            time_data = defaultdict(lambda: {
                "energy_kwh": 0.0,
                "current_avg": 0.0,
                "voltage_avg": 0.0,
                "temperature_avg": 0.0,
                "record_count": 0
            })

            for time_key, record in records:
                time_data[time_key]["energy_kwh"] += record["energy_kwh"]
                time_data[time_key]["current_avg"] += record["current"]
                time_data[time_key]["voltage_avg"] += record["voltage"]
                time_data[time_key]["temperature_avg"] += record["temperature"]
                time_data[time_key]["record_count"] += 1  # Track the number of records per time_key

            # Calculate averages for each time group (e.g., days of the week)
            for time_key, values in time_data.items():
                total_records = values["record_count"]
                if total_records > 0:
                    time_data[time_key]["current_avg"] /= total_records
                    time_data[time_key]["voltage_avg"] /= total_records
                    time_data[time_key]["temperature_avg"] /= total_records

                aggregated_record["data"].append({
                    "time_key": time_key,  # Day of the week (Monday, Tuesday, etc.)
                    "energy_kwh": round(values["energy_kwh"], 2),
                    "current_avg": round(values["current_avg"], 2),
                    "voltage_avg": round(values["voltage_avg"], 2),
                    "temperature_avg": round(values["temperature_avg"], 2)
                })

            result.append(aggregated_record)

    return result

# Generate base hourly data for 3 years (6 AM to 6 PM only)
start_date = datetime.datetime.now() - datetime.timedelta(days=365 * 3)
end_date = datetime.datetime.now()

hourly_data = generate_historical_data(start_date, end_date, smb_count=5)

# Perform aggregations for daily, weekly, monthly, and yearly
daily_data = aggregate_data(hourly_data, "daily")
weekly_data = aggregate_data(hourly_data, "weekly")
monthly_data = aggregate_data(hourly_data, "monthly")
yearly_data = aggregate_data(hourly_data, "yearly")

# Combine data into a structure excluding hourly data
combined_data = [
    {"frequency": "daily", "data": daily_data},
    {"frequency": "weekly", "data": weekly_data},
    {"frequency": "monthly", "data": monthly_data},
    {"frequency": "yearly", "data": yearly_data}
]

# Save to a single JSON file
with open("historical_data_combined.json", "w") as f:
    json.dump(combined_data, f, indent=2)

print("Aggregated data (excluding hourly) with Asia/Kolkata timezone saved to historical_data_combined.json")
