from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from pymongo import MongoClient,UpdateOne
import time
import threading
import logging
import random
import pytz

# MongoDB connection setup
client = MongoClient("mongodb+srv://saigopalbonthu:2BCQe21Y3QDuEuFe@node.8s5hmks.mongodb.net/")  # Replace with your MongoDB URI
db = client['solarR&Ddatabase']  # Database name
collection = db['generated_ids']  # Collection name
solar_plants_collection= db['solar_plants'] # Collection name
power_output_collection = db['power_output'] # Collection name

logger = logging.getLogger(__name__)

@csrf_exempt
def layout_Register(request):
    if request.method == 'POST':
        try:
            # Parse input JSON
            data = json.loads(request.body.decode("utf-8"))
            logger.debug(f"Received data: {data}")

            # Extract and validate inputs
            plant_id = data.get('PlantID')  # Matches the key from the React frontend
            smb_count = data.get('SmbCount')
            string_count = data.get('StringCount')
            panel_count = data.get('PanelCount')

            # Validate required fields
            if not all([plant_id, smb_count, string_count, panel_count]):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Missing required fields: PlantID, SmbCount, StringCount, or PanelCount'
                }, status=400)

            # Ensure numeric fields are integers
            try:
                smb_count = int(smb_count)
                string_count = int(string_count)
                panel_count = int(panel_count)
            except ValueError:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Fields SmbCount, StringCount, and PanelCount must be integers'
                }, status=400)

            # Check for duplicate PlantID
            existing_record = collection.find_one({'PlantID': plant_id})
            if existing_record:
                return JsonResponse({
                    'status': 'error',
                    'message': f'PlantID "{plant_id}" already exists. Please use a unique PlantID.'
                }, status=400)

            # Store the data in MongoDB
            record = {
                'PlantID': plant_id,
                'SmbCount': smb_count,
                'StringCount': string_count,
                'PanelCount': panel_count,
            }
            insert_result=collection.insert_one(record)

              # Add the inserted ID to the response and convert ObjectId to string
            record['_id'] = str(insert_result.inserted_id)

            # Return success response
            return JsonResponse({'status': 'success', 'data': record}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)

        except Exception as e:
            logger.exception("An unexpected error occurred")
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)



# ==================================================================================================================================================
@csrf_exempt
def get_details_by_plant_id(request, plant_id):
    """
    Retrieve SMB, String, and Panel details for a given PlantID.
    """
    if request.method == 'GET':
        try:
            # Query MongoDB for the document with the given PlantID
            record = collection.find_one({'PlantID': plant_id}, {'_id': 0})  # Exclude MongoDB's _id field
            
            if not record:
                return JsonResponse({'status': 'error', 'message': f'No data found for PlantID: {plant_id}'}, status=404)

            # Return the data as JSON
            return JsonResponse({'status': 'success', 'data': record}, status=200)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred: ' + str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_all_plants(request):
    if request.method == 'GET':
        try:
            logger.info("GET request received for all plant details.")
            # Retrieve all plants from the collection
            plants = solar_plants_collection.find({})  # Fetch all fields

            # Prepare a list to hold plant details
            plant_list = []
            for plant in plants:

                plant_details = {
                    'Plant_ID': plant.get('Plant_ID'),
                }
                plant_list.append(plant_details)

            logger.info(f"Retrieved {len(plant_list)} plants.")
            return JsonResponse({'plants': plant_list}, status=200)

        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    logger.warning("Invalid request method used.")
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# =============================================================================================================================================

@csrf_exempt
def get_power_output(request, plant_id):
    if request.method == 'GET':
        try:
            # Fetch the plant data from MongoDB based on PlantID
            plant_data = collection.find_one({'PlantID': plant_id})

            if not plant_data:
                return JsonResponse({'status': 'error', 'message': 'Plant ID not found'}, status=404)

            # Retrieve SMB count and String count from the database
            smb_count = plant_data.get('SmbCount')
            string_count = plant_data.get('StringCount')

            if smb_count is None or string_count is None:
                return JsonResponse({'status': 'error', 'message': 'SmbCount or StringCount missing in the database'}, status=500)

            # Initialize output
            response_data = []

            # Loop to generate power outputs
            for smb in range(1, smb_count + 1):
                for string in range(1, string_count + 1):
                    string_id = f"{smb}.{string}"

                    # Generate initial voltage and current for the string
                    voltage = round(random.uniform(0, 1500), 2)  # Voltage in volts
                    current = round(random.uniform(9, 10.5), 2)  # Current in amperes

                    # Calculate power output for this string
                    power_output = round(voltage * current / 1000, 2)  # Power in kW

                    # Append result to response
                    response_data.append({
                        'plant_id': plant_id,
                        'string_id': string_id,
                        'power_output': power_output,
                        'voltage': voltage,
                        'current': current
                    })

                    # Prepare data for update
                    power_output_data = {
                        'plant_id': plant_id,
                        'string_id': string_id,
                        'voltage': voltage,
                        'current': current,
                        'power_output': power_output,
                        'timestamp': datetime.now()  # Timestamp of when the data was generated
                    }

                    # Update the power output in the database, or create a new document if none exists
                    power_output_collection.update_one(
                        {'plant_id': plant_id, 'string_id': string_id},  # Query to find the document
                        {'$set': power_output_data},  # Update operation to set the new values
                        upsert=True  # Create a new document if none exists
                    )

            # Return the power output data
            return JsonResponse({'status': 'success', 'data': response_data}, status=200)

        except Exception as e:
            logger.error(f"Error in get_power_output: {e}")
            return JsonResponse({'status': 'error', 'message': 'An error occurred'}, status=500)




# =============================================================================================================================================

# def update_power_output(plant_id, smb_count, string_count):
#     """ Function to simulate and update the power output every 10 seconds """
#     while True:
#         try:
#             update_operations = []

#             # Generate power outputs for each string within each SMB
#             for smb in range(1, smb_count + 1):
#                 for string in range(1, string_count + 1):
#                     string_id = f"{smb}.{string}"

#                     # Randomly generate voltage and current for the string
#                     voltage = round(random.uniform(0, 1500), 2)  # Voltage in volts
#                     current = round(random.uniform(9, 10.5), 2)  # Current in amperes

#                     # Calculate power output for this string
#                     power_output = round(voltage * current / 1000, 2)  # Power in watts

#                     # Prepare the power output data to be updated
#                     power_output_data = {
#                         'power_output': power_output,
#                         'voltage': voltage,
#                         'current': current,
#                         'timestamp': datetime.now()  # Add timestamp of when the data was updated
#                     }

#                     # Create the update operation (update the document if it exists)
#                     update_operation = UpdateOne(
#                         {'plant_id': plant_id, 'string_id': string_id},
#                         {'$set': power_output_data},
#                         upsert=True  # If the document doesn't exist, it will be inserted
#                     )

#                     update_operations.append(update_operation)

#             # Perform the bulk update operation
#             if update_operations:
#                 power_output_collection.bulk_write(update_operations)

#             # Log the update
#             logger.info(f"Power output data updated for plant: {plant_id}")

#             # Sleep for 10 seconds before updating again
#             time.sleep(10)
#         except Exception as e:
#             logger.exception(f"Error occurred while updating power output for plant {plant_id}: {str(e)}")

# @csrf_exempt
# def manage_power_output(request, plant_id):
#     if request.method == 'GET':
#         try:
#             # Fetch the power output data from MongoDB based on PlantID
#             power_output_data = list(power_output_collection.find({'plant_id': plant_id}))

#             if not power_output_data:
#                 return JsonResponse({'status': 'error', 'message': 'No power output data found for this plant'}, status=404)

#             # Return the retrieved data
#             return JsonResponse({'status': 'success', 'data': power_output_data}, status=200)

#         except Exception as e:
#             logger.exception("An error occurred while fetching power output data")
#             return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred: ' + str(e)}, status=500)

#     elif request.method == 'POST':
#         try:
#             # Fetch the plant data from MongoDB based on PlantID
#             plant_data = collection.find_one({'PlantID': plant_id})

#             if not plant_data:
#                 return JsonResponse({'status': 'error', 'message': 'Plant ID not found'}, status=404)

#             # Retrieve SMB count and String count from the database
#             smb_count = plant_data.get('SmbCount')
#             string_count = plant_data.get('StringCount')

#             if smb_count is None or string_count is None:
#                 return JsonResponse({'status': 'error', 'message': 'SmbCount or StringCount missing in the database'}, status=500)

#             # Initialize a list to store insert operations if no data exists
#             insert_operations = []

#             # Check if there is any existing data for this plant
#             existing_data = list(power_output_collection.find({'plant_id': plant_id}))
#             if not existing_data:
#                 # Insert data if no existing data found
#                 for smb in range(1, smb_count + 1):
#                     for string in range(1, string_count + 1):
#                         string_id = f"{smb}.{string}"

#                         # Randomly generate voltage and current for the string
#                         voltage = round(random.uniform(0, 1500), 2)  # Voltage in volts
#                         current = round(random.uniform(9, 10.5), 2)  # Current in amperes

#                         # Calculate power output for this string
#                         power_output = round(voltage * current / 1000, 2)  # Power in watts

#                         # Prepare the power output data to be inserted
#                         power_output_data = {
#                             'plant_id': plant_id,
#                             'string_id': string_id,
#                             'power_output': power_output,
#                             'voltage': voltage,
#                             'current': current,
#                             'timestamp': datetime.now()  # Add timestamp of when the data was created
#                         }

#                         # Insert the data into the collection
#                         insert_operations.append(power_output_data)

#                 # Insert new data if no data exists for the plant
#                 if insert_operations:
#                     power_output_collection.insert_many(insert_operations)

#                 # Start the background update thread for this plant
#                 threading.Thread(target=update_power_output, args=(plant_id, smb_count, string_count), daemon=True).start()

#             return JsonResponse({'status': 'success', 'message': 'Power output data inserted and will be updated periodically'}, status=200)

#         except Exception as e:
#             logger.exception("An error occurred while inserting/updating power output data")
#             return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred: ' + str(e)}, status=500)

#     else:
#         return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)