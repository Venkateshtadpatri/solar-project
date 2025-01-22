import json
from pymongo import MongoClient

# MongoDB connection details
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "solarR&Ddatabase"
COLLECTION_NAME = "historical_data"

# Function to seed the database
def seed_database():
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Read data from the JSON file
    with open("historical_data_combined.json", "r") as file:
        data = json.load(file)  # Load JSON data into Python list/dict
    
    # Insert data into MongoDB
    if isinstance(data, list):
        collection.insert_many(data)  # Insert multiple documents
    else:
        collection.insert_one(data)  # Insert a single document

    print(f"Seeded {len(data)} records into the '{COLLECTION_NAME}' collection.")
    client.close()

# Run the seeder
if __name__ == "__main__":
    seed_database()
