import datetime
import random
import json
import pytz

# Set the Asia/Kolkata timezone
kolkata_tz = pytz.timezone('Asia/Kolkata')

# Generate hourly historical data (6 AM to 6 PM) from January 1, 2020, to today
def generate_historical_data(start_date, end_date, smb_count):
    data_list = []  # List of SMB data

    current_date = start_date
    while current_date <= end_date:
        day_data = {
            "date": current_date.strftime('%Y-%m-%d'),
            "smbs": []
        }

        for i in range(1, smb_count + 1):
            smb_data = {"smb_id": f"{i}", "data": []}

            for hour in range(6, 18):  # From 6 AM to 6 PM
                current_datetime = datetime.datetime(
                    current_date.year, current_date.month, current_date.day, hour, tzinfo=kolkata_tz
                )
                record = {
                    "timestamp": current_datetime.strftime('%Y-%m-%d %I:%M:%S %p'),
                    "current_real": round(random.uniform(9.0, 10.5), 2),
                    "current_expected": round(random.uniform(9.0, 10.5), 2),
                    "voltage_real": round(random.uniform(0, 1500), 2),
                    "voltage_expected": round(random.uniform(0, 1500), 2),
                    "temperature": round(random.uniform(20.0, 50.0), 2),
                }
                smb_data["data"].append(record)

            day_data["smbs"].append(smb_data)

        data_list.append(day_data)  # Append day's data

        current_date += datetime.timedelta(days=1)  # Move to the next day

    # Store everything in a single dictionary
    return {"historical_data": data_list}

# Start date: January 1, 2020
start_date = datetime.date(2022, 1, 1)
# End date: Today
end_date = datetime.datetime.now(kolkata_tz).date()

# Generate data
historical_data = generate_historical_data(start_date, end_date, smb_count=5)

# Save to a JSON file
with open("historical.json", "w") as f:
    json.dump(historical_data, f, indent=2)

print("Historical data saved in a single document format.")
