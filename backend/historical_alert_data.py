import random
import json
import datetime
import pytz
import os

# Set the Asia/Kolkata timezone
kolkata_tz = pytz.timezone("Asia/Kolkata")

# Generate historical alert data
def generate_alert_data(start_date, end_date, num_alerts, starting_alert_id=1):
    alert_names = ["Bird waste", "Crack", "Dust", "Shading"]
    severity_levels = ["Critical", "Warning", "Online"]
    actions_required = ["Cleaning", "Inspection", "Repair"]
    statuses = ["inComplete", "Complete"]

    alert_data = []
    current_date = start_date
    alert_id = starting_alert_id

    while current_date <= end_date:
        num_alerts_today = random.randint(1, num_alerts)  # Random number of alerts per day

        for _ in range(num_alerts_today):
            time_detected = datetime.datetime(
                current_date.year, current_date.month, current_date.day,
                random.randint(6, 18), random.randint(0, 59), random.randint(0, 59),
                tzinfo=kolkata_tz
            )
            smb_id = str(random.randint(1, 5))
            alert = {
                "alertID": f"ALT{alert_id:03d}",
                "smb_id": smb_id,
                "string_id": smb_id + "." + str(round(random.uniform(1, 10))),
                "alert_name": random.choice(alert_names),
                "severity_level": random.choice(severity_levels),
                "date": time_detected.strftime('%Y-%m-%d'),
                "action_required": random.choice(actions_required),
                "status": random.choice(statuses)
            }
            alert_data.append(alert)
            alert_id += 1

        current_date += datetime.timedelta(days=1)

    return alert_data

# Start date: January 1, 2022
start_date = datetime.date(2022, 1, 1)
# End date: Today
end_date = datetime.datetime.now(kolkata_tz).date()

# File path for the JSON file
file_path = "historical_alerts_data.json"

# Load existing data if the file exists
if os.path.exists(file_path):
    with open(file_path, "r") as f:
        try:
            existing_data = json.load(f)
            # Ensure the existing data is properly structured
            if "generated_alert_data" in existing_data:
                existing_alerts = existing_data["generated_alert_data"]
            else:
                existing_alerts = []
        except json.JSONDecodeError:
            existing_alerts = []
else:
    existing_alerts = []

# Determine the next alert ID
starting_alert_id = len(existing_alerts) + 1

# Generate new alert data
new_alert_data = generate_alert_data(start_date, end_date, num_alerts=5, starting_alert_id=starting_alert_id)

# Append new data to existing data
existing_alerts.extend(new_alert_data)

# Save updated data back to the JSON file with the "generated_alert_data" key
updated_data = {"generated_alert_data": existing_alerts}

with open(file_path, "w") as f:
    json.dump(updated_data, f, indent=2)

print(f"Appended {len(new_alert_data)} new alerts. Total alerts: {len(existing_alerts)}")
