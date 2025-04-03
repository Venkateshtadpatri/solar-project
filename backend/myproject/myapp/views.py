from django.views.decorators.csrf import csrf_exempt
import json
from collections import defaultdict
from datetime import datetime, timedelta
from pymongo import MongoClient,UpdateOne
import time
import threading
import logging
import random
import pytz
import logging
import re
import os
import requests
import random
from bson import ObjectId
import string
from datetime import datetime, timedelta
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.core.mail import send_mail
from pymongo import MongoClient,errors
from pymongo.errors import PyMongoError
from django.contrib.auth.hashers import make_password, check_password
import traceback
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

#mongodb+srv://saigopalbonthu:2BCQe21Y3QDuEuFe@node.8s5hmks.mongodb.net/
# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017")  # Replace with your MongoDB URI
db = client['solarR&Ddatabase']  # Database name
users_collection = db['users']   # Collection for user registration
admin_collection = db['admin']   # Collection for admin registration
login_history_collection = db['users_login_history'] # Collection for User's Login History
energy_collection = db['solar_plant_data'] # Collection for solar plant data
smb_collection = db['smbs_data'] # Collection for SMB data
string_collection= db['strings_data'] # Collection for string data
faults_collection = db['faults'] # Collection for faults data
graph_collection = db['graph_collection'] # Collection for graph data
alerts_collection = db['alerts'] # Collection for alerts data
analytics_collection = db['historical_data'] # Collection for analytics
historical_collection = db['report_data'] # Collection for report data
alert_history_collection = db['alert_history'] # Collection for alert history
maintenance_tasks_collection = db["maintenance_tasks"]  # Collection for maintenance tasks
maintenance_history_collection=db['maintenance_history'] # Collection for maintenance history
solar_plants_collection= db['solar_plants'] # Collection of solar plants data
power_output_collection = db['power_output'] # Collection of power output data


logger = logging.getLogger(__name__)

# Helper function to validate email format
""" 
name: is_valid_email
Discripion: This function checks whether the provided email address is in a valid format using a regular expression.
Input:email
Output: True, False
"""
def is_valid_email(email):
    email_regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.match(email_regex, email)
# =====================================================================================
@csrf_exempt
def upload_report(request):
    if request.method == "POST" and request.FILES.get("file"):
        file = request.FILES["file"]
        file_path = os.path.join(settings.REPORTS_FOLDER, file.name)

        # Save file to reports folder
        with default_storage.open(file_path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        return JsonResponse({"status": "success", "message": "Report saved successfully!"})

    return JsonResponse({"status": "error", "message": "Invalid request"})

"""
name:solar_plant_registration
description:This function handles the registration of solar plants by validating input data, generating a unique Plant ID, saving details to MongoDB, and notifying the primary contact via email.
input:
-request method:POST
-Fields:plant_name,address,city,state,zip_postal,geolocation,primary_contact_name,primary_contact_number,primary_contact_email,Secondary_contact_name
secondary_contact_email,secondary_contact_phonenumber,no_of_strings,no_of_panels,no_of_smbs,land_area,operating_hours,status,plant_capacity
output:plant resgistered successfully
"""
@csrf_exempt
def solar_plant_registration(request):
    if request.method == 'POST':
        try:
            logger.info("Solar plant registration POST request received.")

            # Access form data and files directly
            plant_name = request.POST.get('PlantName')
            address = request.POST.get('Address')
            city = request.POST.get('City')
            state = request.POST.get('State')
            country = request.POST.get('Country')
            zip_postal = request.POST.get('Zip/Postal')
            geolocation = request.POST.get('Geolocation')
            primary_contact_name = request.POST.get('PrimaryContactName')
            primary_contact_phonenumber = request.POST.get('PrimaryContactPhoneNumber')
            primary_contact_email = request.POST.get('PrimaryContactEmail')
            secondary_contact_name = request.POST.get('SecondaryContactName')
            secondary_contact_phonenumber = request.POST.get('SecondaryContactPhoneNumber')
            secondary_contact_email = request.POST.get('SecondaryContactEmail')
            number_of_panels = request.POST.get('TotalPanelCount')
            number_of_strings = request.POST.get('TotalStringCount')
            number_of_smbs = request.POST.get('TotalSMBCount')
            land_area = request.POST.get('LandArea')
            operating_hours = request.POST.get('OperatingHours')
            status = request.POST.get('Status')
            plant_capacity = request.POST.get('PlantCapacity')
            permits_file = request.FILES.get('PermitsFile')  # Access the uploaded file

            # Validate required fields
            if not plant_name or not address or not city or not state or not zip_postal or not geolocation \
                    or not primary_contact_name or not primary_contact_phonenumber or not primary_contact_email \
                    or not number_of_panels or not number_of_strings or not number_of_smbs or not land_area or not operating_hours or not plant_capacity \
                    or not permits_file:  # Ensure permits_file is also validated
                logger.warning("All fields are required.")
                return JsonResponse({'message': 'All fields are required'}, status=400)

            # Check if the plant name already exists
            if solar_plants_collection.find_one({'Plant_name': plant_name}):
                logger.warning(f"Plant name already exists: {plant_name}")
                return JsonResponse({'message': 'Plant name already exists'}, status=400)

            # Generate Plant_ID in format: SP-[present year]-[Plant Number]
            current_year = datetime.now().year
            last_plant = solar_plants_collection.find().sort("Plant_ID", -1).limit(1)

            # Check if any documents exist in the collection
            if solar_plants_collection.count_documents({}) > 0:
                last_plant_number = int(last_plant[0]['Plant_ID'].split('-')[-1])
            else:
                last_plant_number = 0

            plant_number = last_plant_number + 1
            plant_id = f"SP-{current_year}-{plant_number:04d}"  # 4-digit serialized plant number

            # Save the permits file in the specified folder
            permits_file_path = os.path.join(settings.PERMIT_FILES, permits_file.name)  # Create full file path
            with open(permits_file_path, 'wb+') as destination:
                for chunk in permits_file.chunks():
                    destination.write(chunk)

            logger.info(f"Permits file saved successfully at {permits_file_path}")

            # Prepare data for insertion
            solar_plant = {
                "Plant_ID": plant_id,
                "Plant_name": plant_name,
                "Address": address,
                "city": city,
                "state": state,
                "Country": country,
                "ZIP_Postal": zip_postal,
                "Geolocation": geolocation,
                "primary_contact_name": primary_contact_name,
                "primary_contact_phonenumber": primary_contact_phonenumber,
                "primary_contact_email": primary_contact_email,
                "secondary_contact_name": secondary_contact_name,
                "secondary_contact_phonenumber": secondary_contact_phonenumber,
                "secondary_contact_email": secondary_contact_email,
                "PanelCount": number_of_panels,
                "StringCount": number_of_strings,
                "SMBCount": number_of_smbs,
                "Land_area": land_area,
                "operating_hours": operating_hours,
                "Status": status,
                "plant_capacity": plant_capacity,
                "permits_licenses": permits_file_path  # Store the full file path here
            }

            logger.info(f"Inserting solar plant data into MongoDB for plant: {plant_name}")
            solar_plants_collection.insert_one(solar_plant)

            # Send Plant_ID via email to the primary contact
            try:
                subject = "Solar Plant Registration Successful"
                message = f"Dear {primary_contact_name},\n\nYour solar plant has been registered successfully.\nThe generated Plant ID is: {plant_id}\n\nBest Regards,\nSolar Monitoring Team"
                email_from = settings.EMAIL_HOST_USER
                recipient_list = [primary_contact_email]
                send_mail(subject, message, email_from, recipient_list)
                logger.info(f"Email sent successfully to {primary_contact_email}")
            except Exception as email_error:
                logger.error(f"Error sending email: {email_error}")

            return JsonResponse({'message': 'Solar plant registered successfully', 'Plant_ID': plant_id}, status=201)

        except PyMongoError as e:
            logger.error(f"Database error: {e}")
            return JsonResponse({'error': f'Database error occurred: {str(e)}'}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    else:
        logger.warning("Invalid request method used.")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

"""
name:admin_registration
description:This function registers a new admin by validating input, hashing the password, and saving the data to MongoDB, while handling various errors.
input:
-request method:POST
-Fields:username, email, phone, password
output:admin resgistered successfully and generates admin user_id
"""
@csrf_exempt
def admin_registration(request):
    if request.method == 'POST':
        try:
            logger.info("Admin registration POST request received.")
            data = json.loads(request.body) 
            logger.info(f"Received JSON data: {json.dumps(data)}")
            Plant_ID = data.get('PlantId')
            email = data.get('email')
            phone_number = data.get('phone')
            password = data.get('password')

            # Validate required fields
            if not Plant_ID or not email or not phone_number or not password:
                logger.warning("All fields are required.")
                return JsonResponse({'message': 'All fields are required'}, status=400)

            # Validate email format
            if not is_valid_email(email):
                logger.warning(f"Invalid email format: {email}")
                return JsonResponse({'message': 'Invalid email format'}, status=400)

            # Validate phone number format
            if len(phone_number) != 12 or not phone_number.isdigit():
                logger.warning(f"Invalid phone number: {phone_number}")
                return JsonResponse({'message': 'Phone number must be 10 digits'}, status=400)

            # Check if the email already exists
            if admin_collection.find_one({'email': email}):
                logger.warning(f"Email already exists: {email}")
                return JsonResponse({'message': 'Email already exists'}, status=400)

            # Check if the Plant_ID already exists
            if admin_collection.find_one({'Plant_ID': Plant_ID}):
                logger.warning(f"Plant ID already exists: {Plant_ID}")
                return JsonResponse({'message': 'Admin with that Plant ID already exists'}, status=400)

            # Create user_id using Plant_ID and "A01"
            user_id = f"{Plant_ID}-01"
            logger.info(f"Generated user_id: {user_id} for Plant ID: {Plant_ID}")

            # Hash the password
            logger.info(f"Hashing password for user with Plant ID: {Plant_ID}")
            hashed_password = make_password(password)

            # Insert admin data into MongoDB
            admin_data = {
                'Plant_ID': Plant_ID,
                'user_id': user_id,  # Include user_id in the database entry
                'email': email,
                'phone_number': phone_number,
                'password': hashed_password,
            }
            logger.info(f"Inserting admin data into MongoDB for Plant ID: {Plant_ID}")
            admin_collection.insert_one(admin_data)
            logger.info(f"Admin registered successfully for Plant ID: {Plant_ID}")
            return JsonResponse({'message': 'Admin registered successfully'}, status=201)

        except PyMongoError as e:
            logger.error(f"Database error: {e}")
            return JsonResponse({'error': f'Database error occurred: {str(e)}'}, status=500)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            return JsonResponse({'error': f'Invalid JSON format: {str(e)}'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    else:
        logger.warning("Invalid request method used.")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

""" 
name:A common login page for user and admin 
Description: This function handles user or admin login by validating credentials and role, checking them in the database, and returning 
appropriate success or error responses.
Input:
-request method:POST
-input fields:user_id, password, role,plant_id
Output:user or admin login successful 
"""    
@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            logger.info("Login POST request received.")

            data = json.loads(request.body)
            logger.info(f"Received JSON data: {json.dumps(data)}")
            user_id = data.get('user_id')  # Replacing 'username' with 'user_id'
            password = data.get('password')
            role = data.get('role')
            PlantId = data.get('Plant_ID')  # Role can be 'admin' or 'user'

            # Validate required fields
            if not user_id or not password or not role:
                logger.warning("Missing required fields in the login request.")
                return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

            if role == 'admin':
                logger.info(f"Attempting admin login for user_id: {user_id}")
                admin = admin_collection.find_one({'user_id': user_id})  # Search by 'user_id'
                if admin and check_password(password, admin['password']):
                    logger.info(f"Admin login successful for user_id: {user_id}")
                    return JsonResponse({'status': 'success', 'message': 'Admin login successful'}, status=200)
                else:
                    logger.warning(f"Invalid admin credentials for user_id: {user_id}")
                    return JsonResponse({'status': 'error', 'message': 'Invalid admin credentials'}, status=401)
            
            elif role == 'user':
                logger.info(f"Attempting user login for user_id: {user_id}")

                # Fetch the plant document by its PlantId
                plant = users_collection.find_one({'Plant_ID': PlantId})  # You should pass PlantId in the request
                if not plant:
                    logger.warning(f"Plant not found for PlantId: {PlantId}")
                    return JsonResponse({'status': 'error', 'message': 'Plant not found'}, status=404)

                # Find the user within the plant's 'users' array
                user = None
                for u in plant['users']:
                    if u['user_id'] == user_id:
                        user = u
                        break

                if not user:
                    logger.warning(f"User not found for user_id: {user_id}")
                    return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

                # Check the password
                if check_password(password, user['password']):
                    logger.info(f"User login successful for user_id: {user_id}")

                    # Log user login history (update if required for new structure)
                    log_login_history(user_id, PlantId)

                    return JsonResponse({'status': 'success', 'message': 'User login successful'}, status=200)
                else:
                    logger.warning(f"Invalid password for user_id: {user_id}")
                    return JsonResponse({'status': 'error', 'message': 'Invalid user credentials'}, status=401)
            
            else:
                logger.warning(f"Invalid role specified: {role}")
                return JsonResponse({'status': 'error', 'message': 'Invalid role'}, status=400)

        except PyMongoError as e:
            logger.error(f"Database error: {e}")
            return JsonResponse({'status': 'error', 'message': 'Database error occurred'}, status=500)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            logger.error(f"Stack Trace: {traceback.format_exc()}")
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred', 'error': str(e)}, status=500)

    else:
        logger.warning("Invalid request method used for login.")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
"""
name: Logs a user's login history in the database.
Description: This function logs the user login details and updates the database
Input:
    -user_id (str): The ID of the user logging in.
    -plant_id (str): The ID of the plant associated with the login.

Output: None
Raises:
    PyMongoError: If a MongoDB error occurs during the login history logging process.
    Exception: If any other unexpected error occurs during the login history logging process.
"""
def log_login_history(user_id, plant_id):
    try:
        # Get current time in Asia/Kolkata timezone
        tz = pytz.timezone('Asia/Kolkata')
        login_time = datetime.now(tz).strftime('%d-%m-%Y %I:%M:%S %p')
        # Prepare login data to be inserted
        login_history_data = {
            'user_id': user_id,
            'logintime': login_time
        }

        logger.info(f"Logging user login history for user_id: {user_id} under plant_id: {plant_id}")

        # Insert the login history into the respective plant document
        plant_data = login_history_collection.find_one({'Plant_ID': plant_id})

        if plant_data:
            # If plant already exists, update the existing login history list
            login_history_collection.update_one(
                {'Plant_ID': plant_id},
                {'$push': {'login_history': login_history_data}}
            )
            logger.info(f"Successfully logged login history for user_id: {user_id} under plant_id: {plant_id}")
        else:
            # If plant doesn't exist, create a new document
            new_plant_data = {
                'Plant_ID': plant_id,
                'login_history': [login_history_data]
            }
            login_history_collection.insert_one(new_plant_data)
            logger.info(f"Successfully created new login history document for plant_id: {plant_id}")

    except PyMongoError as e:
        logger.error(f"Error logging login history: {e}")
    except Exception as e:
        logger.error(f"Unexpected error logging login history: {e}")

""" 
name:user login history page
Discripion: This function handles user login history which can be retrived from the database
Input:
-request method:GET
Output:Getting the users login history
""" 
@csrf_exempt
def get_login_history(request, plant_id):
    try:
        # Only allow GET requests
        if request.method == 'GET':
            logger.info("Fetching login history data")

            if plant_id:
                # Retrieve login history records for a specific plant
                plant_data = login_history_collection.find_one({'plant_id': plant_id}, {"_id": 0})
                
                if plant_data:
                    login_history = plant_data.get('login_history', [])
                    return JsonResponse({'status': 'success', 'data': login_history}, status=200)
                else:
                    return JsonResponse({'status': 'error', 'message': 'Plant not found'}, status=404)
            else:
                # Retrieve all login history records from all plants
                login_history = list(login_history_collection.find({}, {"_id": 0}))  # Exclude _id
                return JsonResponse({'status': 'success', 'data': login_history}, status=200)

        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

    except PyMongoError as e:
        logger.error(f"Error fetching login history: {e}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)
    except Exception as e:
        logger.error(f"Unexpected error: {traceback.format_exc()}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)

"""
name:get_all_plants
description:This function get the all plants details 
input:
-request method:GET
output:getting the plant details
"""
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
                geolocation = plant.get('Geolocation')

                # Ensure the Geolocation field contains valid JSON
                if geolocation:
                    try:
                        geolocation_data = json.loads(geolocation)
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in Geolocation for Plant ID: {plant.get('Plant_ID')}")
                        geolocation_data = None
                else:
                    geolocation_data = None

                plant_details = {
                    'Plant_ID': plant.get('Plant_ID'),
                    'Plant_name': plant.get('Plant_name'),
                    'Address': plant.get('Address'),
                    'City': plant.get('city'),
                    'State': plant.get('state'),
                    'ZIP/Postal': plant.get('ZIP_Postal'),
                    'Geolocation': geolocation_data,
                    'Primary_contact_name': plant.get('primary_contact_name'),
                    'Primary_contact_phonenumber': plant.get('primary_contact_phonenumber'),
                    'Primary_contact_email': plant.get('primary_contact_email'),
                    'Secondary_contact_name': plant.get('secondary_contact_name'),
                    'Secondary_contact_phonenumber': plant.get('secondary_contact_phonenumber'),
                    'Secondary_contact_email': plant.get('secondary_contact_email'),
                    'Number_of_panels': plant.get('PanelCount'),
                    'Land_area': plant.get('Land_area'),
                    'Operating_hours': plant.get('operating_hours'),
                    'Status': plant.get('Status'),
                    'Permits/licenses': plant.get('permits_licenses')
                }
                plant_list.append(plant_details)

            logger.info(f"Retrieved {len(plant_list)} plants.")
            return JsonResponse({'plants': plant_list}, status=200)

        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    logger.warning("Invalid request method used.")
    return JsonResponse({'error': 'Invalid request method'}, status=405)

""" 
name:Add-user
Discripion: This function registers a new user by validating input, hashing the password, saving the details in MongoDB, and sending a 
confirmation email. It handles errors related to input validation, database operations, and email sending.
Input:
-request method:POST
-Fields:email, username, password, plant_id
Output: User registered successfully and generates the users user_id
"""
@csrf_exempt
def add_user(request):
    if request.method == 'POST':
        try:
            tz = pytz.timezone('Asia/Kolkata')
            data = json.loads(request.body)
            email = data.get('email')
            phone = data.get('phone')
            password = data.get('password')
            plant_id = data.get('Plant_ID')

            # Validate required fields
            if not plant_id or not email or not password or not phone:
                return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

            # Validate email format
            if not is_valid_email(email):
                return JsonResponse({'status': 'error', 'message': 'Invalid email format'}, status=400)

            # Fetch the plant document from the collection
            plant_exist = solar_plants_collection.find_one({'Plant_ID': plant_id})

            # Check if the PlantId exists
            if not plant_exist:
                return JsonResponse({'status': 'error', 'message': 'Plant ID does not exist or is not registered'}, status=404)

            # Fetch the plant document from the users collection
            plant_document = users_collection.find_one({'Plant_ID': plant_id})

            # Check if the plant document exists
            if not plant_document:
                # If no plant document is found, create a new document with an empty 'users' field
                plant_document = {
                    'Plant_ID': plant_id,
                    'users': []  # Initialize the users array if not found
                }
                # Insert the new document into the collection
                users_collection.insert_one(plant_document)

            # Check if the 'users' field exists and is not empty
            if 'users' not in plant_document or not plant_document['users']:
                plant_document['users'] = []  # Ensure users field is a list

            # Check for duplicate email or phone number in the plant's users
            for user in plant_document['users']:
                if user['email'] == email:
                    return JsonResponse({'status': 'error', 'message': 'User with this email already exists'}, status=400)
                if user['phone'] == phone:
                    return JsonResponse({'status': 'error', 'message': 'User with this phone number already exists'}, status=400)

            # Hash the password before saving it to the database
            hashed_password = make_password(password)

            # Generate a new user_id for this PlantId
            last_user = plant_document.get('users', [])[-1] if plant_document.get('users') else None
            last_number = int(last_user['user_id'].split('-')[-1]) if last_user else 1
            new_user_number = last_number + 1
            user_id = f"{plant_id}-{str(new_user_number).zfill(2)}"

            # Prepare user data
            user_data = {
                'user_id': user_id,
                'email': email,
                'phone': phone,
                'password': hashed_password,
                'dateCreated': datetime.now(tz).strftime('%d/%m/%Y %I:%M:%S %p')
            }

            # Append the new user to the users array
            users_collection.update_one(
                {'Plant_ID': plant_id},
                {'$push': {'users': user_data}}
            )

            try:
                # Send email with the generated user_id
                send_mail(
                    'Account Created',
                    f'Your User ID: {user_id}\nPassword: {password}',  # Avoid sending passwords in production
                    'mailto:divya.mepstra@gmail.com',
                    [email],
                    fail_silently=False
                )
            except Exception as email_error:
                logger.error(f'Failed to send email to {email}: {str(email_error)}', exc_info=True)

            return JsonResponse({
                'status': 'success',
                'message': 'User added successfully',
                'user': user_data
            }, status=201)

        except json.JSONDecodeError:
            logger.error('Failed to parse request body as JSON', exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON in request body'}, status=400)
        
        except Exception as e:
            logger.error(f'Error in add_user API: {str(e)}', exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

"""
Name: get_all_users
Description: Retrieves all users associated with a specific plant ID from the MongoDB collection.
Input:
    - Request Method: GET
    - input field:Plant_id
Output:list (array of user objects associated with the plant)
"""
@csrf_exempt
def get_all_users(request, plant_id):
    """
    Fetch all users of a specific plant.
    :param request: HTTP request object
    :param plant_id: ID of the plant to fetch users for
    :return: JSON response with user data
    """
    if request.method == 'GET':
        try:
            # Check if the plant exists in the database
            plant_document = users_collection.find_one({'Plant_ID': plant_id})
            
            if not plant_document:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Plant ID does not exist or is not registered'
                }, status=404)

            # Retrieve users array from the plant document
            users = plant_document.get('users', [])

            if not users:
                # Optional: You can include a message indicating no users found
                return JsonResponse({
                    'status': 'success',
                    'Plant_ID': plant_id,
                    'users': [],
                    'message': 'No users associated with this plant ID'
                }, status=200)

            return JsonResponse({
                'status': 'success',
                'Plant_ID': plant_id,
                'users': users
            }, status=200)

        except Exception as e:
            logger.error(f"Error in get_all_users API: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred'
            }, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


"""
Name: generate_energy_data
Description: Generates and stores random energy production data for different timeframes (Daily, Weekly, Monthly, Yearly) 
and updates or inserts it into the MongoDB collection.
Input:
    - Request Method: Any (though typically GET or POST depending on usage context)
    - input filed:No parameters are required in the request.
Output:graph format is displayed in the frontend
"""
@csrf_exempt
def generate_energy_data(request):
    try:
        # Get the current time in Asia/Kolkata timezone using pytz
        kolkata_timezone = pytz.timezone("Asia/Kolkata")
        current_time = datetime.now(kolkata_timezone)

        # Generate energy data for 'Daily'
        daily_time_slots = [(current_time - timedelta(hours=i)).strftime('%I %p') for i in range(5)]  # Last 5 hours
        daily_data = [{'time': time_slot, 'energy': random.randint(10, 25)} for time_slot in daily_time_slots]

        # Generate energy data for 'Weekly'
        weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        current_weekday = current_time.weekday()  # 0 = Monday, 6 = Sunday
        weekly_time_slots = [weekdays[(current_weekday - i) % 7] for i in range(7)]  # Last 7 days
        weekly_data = [{'time': day, 'energy': random.randint(100, 250)} for day in weekly_time_slots]

        # Generate energy data for 'Monthly'
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        current_month = current_time.month  # Get the current month (1 = Jan, 12 = Dec)
        monthly_time_slots = [month_names[(current_month - i - 1) % 12] for i in range(12)]
        monthly_data = [{'time': month, 'energy': random.randint(100, 250)} for month in monthly_time_slots]

        # Generate energy data for 'Yearly'
        current_year = current_time.year
        yearly_time_slots = [str(year) for year in range(2016, current_year + 1)]  # From 2016 to current year
        yearly_data = [{'time': year, 'energy': random.randint(1000, 2500)} for year in yearly_time_slots]

        # Reverse the data lists for each timeframe
        daily_data.reverse()
        weekly_data.reverse()
        monthly_data.reverse()

        # Combine all data into one response
        all_timeframes_data = {
            'Daily': daily_data,
            'Weekly': weekly_data,
            'Monthly': monthly_data,
            'Yearly': yearly_data
        }

        # Check if the document for all timeframes already exists
        existing_data = graph_collection.find_one({'type': 'all_timeframes'})

        if existing_data:
            graph_collection.update_one(
                {'type': 'all_timeframes'},
                {'$set': {
                    'timestamp': current_time.timestamp(),
                    'energy_data': all_timeframes_data
                }}
            )
        else:
            graph_collection.insert_one({
                'type': 'all_timeframes',
                'timestamp': current_time.timestamp(),
                'energy_data': all_timeframes_data
            })

        return JsonResponse({'energy_data': all_timeframes_data})

    except Exception as e:
        return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)

"""
Name: solar_plant_data
Description: Updates or inserts randomly generated solar plant data into the MongoDB collection and returns it.
Input:
   - Request Method: Any (typically GET or POST)
   - input fields: No parameters are required in the request.
Output:JSON response with solar plant efficiency, total energy generated, and total energy produced.
"""
@csrf_exempt
def solar_plant_data(request):
    try:
        # Generate random data for the attributes
        solar_power_plant_efficiency = round(random.uniform(70, 95), 2)
        total_energy_generated = round(random.uniform(100, 1000), 2)
        total_energy_produced = round(random.uniform(1000, 100000), 2)

        # Current timestamp
        timestamp = datetime.now().timestamp()  # Updated this line

        # Data to be updated
        data = {
            'solar_power_plant_efficiency': solar_power_plant_efficiency,
            'total_energy_generated': total_energy_generated,
            'total_energy_produced': total_energy_produced,
            'timestamp': timestamp
        }

        # Update the document in the collection
        energy_collection.update_one(
            {},
            {'$set': data},
            upsert=True
        )

        return JsonResponse({
            'solar_power_plant_efficiency': f"{solar_power_plant_efficiency}",
            'total_energy_generated': f"{total_energy_generated}",
            'total_energy_produced': f"{total_energy_produced}"
        })

    except Exception as e:
        return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)

"""
Name: delete_plant
Description: Deletes a solar plant from the database based on the provided plant ID.
Input:
    - Request Method: DELETE
    - input fields:plant_id
Output:JSON response indicating success or error status, along with a message.
"""
@csrf_exempt
def delete_plant(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            plant_id = data.get('plant_id')
            # Check if the plant exists in the database
            result = solar_plants_collection.delete_one({'Plant_ID': plant_id})

            if result.deleted_count == 0:
                return JsonResponse({'status': 'error', 'message': 'Plant not found'}, status=404)

            return JsonResponse({'status': 'success', 'message': 'Plant deleted successfully'})

        except Exception as e:
            logger.error(f'Error in delete_plant API: {str(e)}', exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

""" 
 name:sent_otp 
 Description: This function generates and sends an OTP to the user's email for password reset, while updating the 
 OTP details in the database and handling errors.
 Input:email
 Output: otp sended successfully
 """
@csrf_exempt
def send_otp(request):
    OTP_EXPIRATION_TIME_MINUTES = 1  # Set OTP expiration time to 5 minutes
    timezone = pytz.timezone('Asia/Kolkata')  # Use your preferred timezone

    if request.method == 'POST':
        try:
            logger.info("send_otp POST request received.")
            data = json.loads(request.body)

            logger.info(f"Received JSON data: {json.dumps(data)}")
            email = data.get('email')
            user_id = data.get('user_id')

            # Validate email field
            if not email or email.strip() == '':
                logger.warning("Email is required but missing.")
                return JsonResponse({'status': 'error', 'message': 'Email is required'}, status=400)
            if not user_id:
                logger.warning("user_id is required but missing.")
                return JsonResponse({'status': 'error', 'message': 'user_id is required'}, status=400)

            # Validate email format
            if not is_valid_email(email):
                logger.warning(f"Invalid email format for email: {email}")
                return JsonResponse({'status': 'error', 'message': 'Invalid email format'}, status=400)

            # Check if the email exists in either collection
            admin = admin_collection.find_one({'email': email, 'user_id': user_id})
            user = None

            # Search for the user within the 'users' array of the specific plant in users_collection
            plant = users_collection.find_one({'users.email': email, 'users.user_id': user_id})  # Searching within the 'users' array by email
            if plant:
                # Loop through the users in the plant document to find the user with the matching email
                for u in plant.get('users', []):  # Ensure 'users' field exists
                    if u.get('email') == email and u.get('user_id') == user_id:
                        user = u
                        break

            if admin:
                logger.info(f"Email found in admin collection: {email}")
                collection = admin_collection
            elif user:
                logger.info(f"Email found in users collection: {email}")
                collection = users_collection
            else:
                logger.warning(f"Email not found in both admin and users collections: {email}")
                return JsonResponse({'status': 'error', 'message': 'Email not found'}, status=404)

            # Generate a new OTP
            otp = ''.join(random.choices('123456789', k=1)) + ''.join(random.choices('0123456789', k=5))  # 6-digit OTP
            otp_creation_time = datetime.now(timezone)
            otp_expiry_time = otp_creation_time + timedelta(minutes=OTP_EXPIRATION_TIME_MINUTES)

            # Format the timestamps
            formatted_creation_time = otp_creation_time.strftime('%d/%m/%Y - %A - %H:%M:%S')
            formatted_expiry_time = otp_expiry_time.strftime('%d/%m/%Y - %A - %H:%M:%S')

            # Update the collection with the OTP and timestamp
            if collection == admin_collection:
                collection.update_one(
                    {'email': email, 'user_id': user_id},
                    {'$set': {'otp': otp, 'otp_creation_time': formatted_creation_time, 'otp_expiry_time': formatted_expiry_time}}
                )
            else:
                # In the users collection, update the user within the plant's 'users' array
              users_collection.update_one(
                    {'_id': plant['_id'], 'users.email': email, 'users.user_id': user_id},
                    {'$set': {'users.$.otp': otp, 'users.$.otp_creation_time': formatted_creation_time, 'users.$.otp_expiry_time': formatted_expiry_time}}
                )

            logger.info(f"OTP generated for {email}: {otp}, expiry time: {formatted_expiry_time}")

            # Send the OTP to the user's email
            try:
                subject = 'Your OTP for Account Verification'
                html_content = render_to_string('otp_email.html', {'otp': otp})
                email_message = EmailMultiAlternatives(subject, '', settings.DEFAULT_FROM_EMAIL, [email])
                email_message.attach_alternative(html_content, "text/html")
                email_message.send()
                logger.info(f"OTP email sent successfully to {email}")
            except Exception as e:
                logger.error(f"Failed to send OTP email to {email}: {e}")
                return JsonResponse({'status': 'error', 'message': 'Failed to send OTP email'}, status=500)

            return JsonResponse({'status': 'success', 'message': 'OTP sent to email'}, status=200)

        except json.JSONDecodeError:
            logger.error("Invalid JSON format received in send_otp request.")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # Log the unexpected error
            logger.error(f"Unexpected error in send_otp: {e}")
            logger.error(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)
    else:
        logger.warning("Invalid request method for send_otp. Only POST allowed.")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

""" 
name: verify_otp
 Description: This function generates and sends a time-limited OTP to a user's email for password reset, updating the database 
with OTP and expiration details.
 Input:email, otp
 Output: otp verified successfully
"""
@csrf_exempt
def verify_otp(request):
    timezone = pytz.timezone('Asia/Kolkata')  # Use your preferred timezone

    if request.method == 'POST':
        try:
            logger.info("verify_otp POST request received.")
            data = json.loads(request.body)
            logger.info(f"Received JSON data: {json.dumps(data)}")

            email = data.get('email')
            user_id = data.get('user_id')
            otp = data.get('otp')

            # Validate email, user_id, and OTP fields
            if not email or not user_id or not otp:
                logger.warning("Email, user_id, or OTP is missing in verify_otp request.")
                return JsonResponse({'status': 'error', 'message': 'Email, user_id, and OTP are required'}, status=400)

            # Check if the email and user_id exist in admin or users collections
            admin = admin_collection.find_one({'email': email, 'user_id': user_id})
            plant = users_collection.find_one({'users.email': email, 'users.user_id': user_id})

            is_admin = False
            user_record = None

            if admin:
                logger.info(f"Email found in admin collection: {email}, {user_id}")
                is_admin = True
                user_record = admin  # Admin records directly contain the OTP fields
            elif plant:
                logger.info(f"Email found in users collection: {email}, {user_id}")
                # Find the specific user in the 'users' array
                if 'users' in plant:
                    for user in plant['users']:
                        if user['email'] == email and user['user_id'] == user_id:
                            user_record = user
                            break

            if not user_record:
                logger.warning(f"No record found for {email}, {user_id}")
                return JsonResponse({'status': 'error', 'message': 'User record not found'}, status=404)

            # Check if the OTP exists in the record
            stored_otp = user_record.get('otp')
            if not stored_otp:
                logger.warning(f"OTP not found for {email}, {user_id}")
                return JsonResponse({'status': 'error', 'message': 'OTP not found for this email'}, status=400)

            # Validate the OTP
            if stored_otp != otp:
                logger.warning(f"Invalid OTP for {email}: {otp}")
                return JsonResponse({'status': 'error', 'message': 'Invalid OTP'}, status=400)

            # Check if the OTP has expired
            otp_expiry_time_str = user_record.get('otp_expiry_time')
            if not otp_expiry_time_str:
                logger.error(f"OTP expiry time not found for {email}, {user_id}")
                return JsonResponse({'status': 'error', 'message': 'OTP expiry time not found'}, status=400)

            # Parse the expiry time string into a datetime object
            otp_expiry_time = datetime.strptime(otp_expiry_time_str, '%d/%m/%Y - %A - %H:%M:%S')
            otp_expiry_time = timezone.localize(otp_expiry_time)  # Ensure it is timezone-aware

            # Get the current time in the same timezone
            now = datetime.now(timezone)

            if now > otp_expiry_time:
                logger.warning(f"OTP expired for {email}. Expiry time: {otp_expiry_time}")
                return JsonResponse({'status': 'error', 'message': 'OTP has expired'}, status=400)

            logger.info(f"OTP verified successfully for {email}")
            return JsonResponse({'status': 'success', 'message': 'OTP verified successfully'}, status=200)

        except json.JSONDecodeError:
            logger.error("Invalid JSON format received in verify_otp request.")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # Log the unexpected error with a traceback
            logger.error(f"Unexpected error in verify_otp: {e}")
            logger.error(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)
    else:
        logger.warning("Invalid request method for verify_otp. Only POST allowed.")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

""" 
name: resend_otp
Description: This function resend a new OTP to the user's email, updates the OTP details in the database, and handles 
errors related to email validation, database access, and email sending.
Input:
-request method:POST
-input field:email, user_id
Output: otp resended successfully
"""
@csrf_exempt
def resend_otp(request):
    OTP_EXPIRATION_TIME_MINUTES = 1  # Set OTP expiration time
    timezone = pytz.timezone('Asia/Kolkata')  # Use your preferred timezone

    if request.method == 'POST':
        try:
            logger.info("resend_otp POST request received.")
            data = json.loads(request.body)
            logger.info(f"Received JSON data: {json.dumps(data)}")

            email = data.get('email')
            user_id = data.get('user_id')

            # Validate email field
            if not email or email.strip() == '':
                logger.warning("Email is required but missing in resend_otp.")
                return JsonResponse({'status': 'error', 'message': 'Email is required'}, status=400)

            if not user_id:
                logger.warning("user_id is required but missing in resend_otp.")
                return JsonResponse({'status': 'error', 'message': 'user_id is required'}, status=400)

            # Validate email format
            if not is_valid_email(email):
                logger.warning(f"Invalid email format in resend_otp: {email}")
                return JsonResponse({'status': 'error', 'message': 'Invalid email format'}, status=400)

            # Check if the email exists in either the admin or users collection
            user = admin_collection.find_one({'email': email, 'user_id': user_id})
            collection_name = 'admin'

            if not user:
                user = users_collection.find_one({'users.email': email, 'users.user_id': user_id})
                if user:
                    collection_name = 'user'
                else:
                    logger.warning(f"Email not found in resend_otp: {email}, user_id: {user_id}")
                    return JsonResponse({'status': 'error', 'message': 'Email not found'}, status=404)

            # Generate a new OTP
            new_otp = ''.join(random.choices('123456789', k=1)) + ''.join(random.choices('0123456789', k=5))  # 6-digit OTP
            otp_creation_time = datetime.now(timezone)
            otp_expiry_time = otp_creation_time + timedelta(minutes=OTP_EXPIRATION_TIME_MINUTES)

            # Format the timestamps
            formatted_creation_time = otp_creation_time.strftime('%d/%m/%Y - %A - %H:%M:%S')
            formatted_expiry_time = otp_expiry_time.strftime('%d/%m/%Y - %A - %H:%M:%S')

            # Update the document with the new OTP and timestamp
            if collection_name == 'admin':
                admin_collection.update_one(
                    {'email': email, 'user_id': user_id},
                    {'$set': {
                        'otp': new_otp,
                        'otp_creation_time': formatted_creation_time,
                        'otp_expiry_time': formatted_expiry_time
                    }}
                )
            else:
                users_collection.update_one(
                    {'users.email': email, 'users.user_id': user_id},
                    {'$set': {
                        'users.$.otp': new_otp,
                        'users.$.otp_creation_time': formatted_creation_time,
                        'users.$.otp_expiry_time': formatted_expiry_time
                    }}
                )

            logger.info(f"New OTP generated for {email}: {new_otp}, expiry time: {formatted_expiry_time}")

            # Send the new OTP to the user's email
            try:
                subject = 'Your New OTP for Password Reset'
                html_content = render_to_string('otp_email.html', {'otp': new_otp})
                email_message = EmailMultiAlternatives(subject, '', settings.DEFAULT_FROM_EMAIL, [email])
                email_message.attach_alternative(html_content, "text/html")
                email_message.send()
                logger.info(f"New OTP email sent successfully to {email}")
            except Exception as e:
                logger.error(f"Failed to send new OTP email to {email}: {e}")
                return JsonResponse({'status': 'error', 'message': 'Failed to send new OTP email'}, status=500)

            return JsonResponse({'status': 'success', 'message': 'New OTP sent to email'}, status=200)

        except json.JSONDecodeError:
            logger.error("Invalid JSON format received in resend_otp request.")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # Log the unexpected error with a traceback
            logger.error(f"Unexpected error in resend_otp: {e}")
            import traceback
            logger.error(traceback.format_exc())  # Logs detailed traceback for debugging
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)
    else:
        logger.warning("Invalid request method for resend_otp. Only POST allowed.")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

""" 
name:delete_user
Description: This function handles deleting the user from the user collection.
Input:
-request method:DELETE(plant_id,user_id)
Output:user deleted successfully 
"""
@csrf_exempt
def delete_user(request, plant_id, user_id):
    if request.method == 'DELETE':
        
        try:
            # Validate plant_id and user_id
            if not plant_id:
                return JsonResponse({'status': 'error', 'message': 'Plant ID is required'}, status=400)
            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'User ID is required'}, status=400)

            # Find the plant by plant_id
            plant_document = users_collection.find_one({'Plant_ID': plant_id})
            if not plant_document:
                return JsonResponse({'status': 'error', 'message': 'Plant ID does not exist or is not registered'}, status=404)

            # Ensure the user exists within the specified plant
            users = plant_document.get('users', [])
            user = next((u for u in users if u['user_id'] == user_id), None)
            if not user:
                return JsonResponse({'status': 'error', 'message': f'User with ID {user_id} not found in the specified plant'}, status=404)

            # Remove the user from the plant's users array
            result = users_collection.update_one(
                {'Plant_ID': plant_id},
                {'$pull': {'users': {'user_id': user_id}}}
            )

            # Check if the update was successful
            if result.modified_count == 0:
                return JsonResponse({'status': 'error', 'message': 'Failed to delete user'}, status=500)

            return JsonResponse({'status': 'success', 'message': f'User with ID {user_id} deleted successfully from plant {plant_id}'}, status=200)

        except Exception as e:
            # Log the detailed exception
            logger.error(f"Error in delete_user API: {str(e)}", exc_info=True)
            
            # Return a more descriptive error message
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred',
                'error_details': str(e)  # Include error details for debugging
            }, status=500)

    # If the request method is not DELETE, return a 405 Method Not Allowed
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

""" 
name: reset_password
Discripion: Handles the password reset functionality for users and admin by validating the provided email, user ID, and new password, and
updating the password in the respective MongoDB collection.
Input:
-Request Method: POST
-input fields:email,new_password, user_id
Output: Password reset successfully
"""
@csrf_exempt
def reset_password(request):
    timezone = pytz.timezone('Asia/Kolkata')  # Use your preferred timezone

    if request.method == 'POST':
        try:
            logger.info("reset_password POST request received.")

            # Parse the request body
            data = json.loads(request.body.decode('utf-8'))
            logger.info(f"Received JSON data: {json.dumps(data)}")

            email = data.get('email')
            user_id = data.get('user_id')
            new_password = data.get('new_password')

            # Validate email and new_password fields
            if not email or not new_password or not user_id:
                logger.warning("Email or new_password is missing in reset_password request.")
                return JsonResponse({'status': 'error', 'message': 'Email and new password are required'}, status=400)

            # Validate email format
            if not is_valid_email(email):
                logger.warning(f"Invalid email format in reset_password: {email}")
                return JsonResponse({'status': 'error', 'message': 'Invalid email format'}, status=400)

            # Check if email exists in the admin collection
            admin = admin_collection.find_one({'email': email, 'user_id': user_id})
            if admin:
                logger.info(f"Email found in admin collection: {email, user_id}")
                collection = admin_collection
            else:
                # If not found in admin, check in users collection
                user = users_collection.find_one({'users.email': email, 'users.user_id': user_id})
                if not user:
                    logger.warning(f"Email not found in both admin and users collections: {email, user_id}")
                    return JsonResponse({'status': 'error', 'message': 'Email not found'}, status=404)
                collection = users_collection

            # Hash the new password
            hashed_password = make_password(new_password)

            # Update the password in the collection
            if collection == admin_collection:
                result = collection.update_one(
                    {'email': email, 'user_id': user_id},
                    {'$set': {'password': hashed_password}}
                )
            else:
                result = collection.update_one(
                    {'users.email': email, 'users.user_id': user_id},
                    {'$set': {'users.$.password': hashed_password}}
                )

            if result.modified_count == 0:
                logger.warning(f"Failed to update password for {email, user_id}")
                return JsonResponse({'status': 'error', 'message': 'Failed to reset password'}, status=500)

            logger.info(f"Password reset successfully for {email, user_id}")
            return JsonResponse({'status': 'success', 'message': 'Password reset successfully'}, status=200)

        except json.JSONDecodeError:
            logger.error("Invalid JSON format received in reset_password request.")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in reset_password: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    else:
        logger.warning("Invalid request method for reset_password. Only POST allowed.")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

"""
Name: get_user_details_by_id
Description: Retrieves user details, including email, by user ID and associated Plant ID.
Input:
   - Request Method: GET
   -url parameters:user_id
   -input fields: PlantId 
Output:JSON response with user email if found, or an error message if not.
"""
@csrf_exempt
def get_user_details_by_id(request, user_id):
    """
    Fetch a user's email ID based on their user_id and plant_id.

    Args:
        request: The HTTP request object.
        user_id: The ID of the user.

    Returns:
        JsonResponse: A structured response with the user's details or an error message.
    """
    if request.method == 'GET':
        try:
            # Parse the JSON body
            data = json.loads(request.body)
            logger.info(f"Received JSON data: {json.dumps(data)}")

            # Validate required fields
            plant_id = data.get('PlantId')
            if not plant_id:
                return JsonResponse({'status': 'error', 'message': 'Plant ID is required'}, status=400)

            # Fetch the plant document from MongoDB
            plant_document = users_collection.find_one({'Plant_ID': plant_id})
            if not plant_document:
                return JsonResponse({'status': 'error', 'message': 'Plant ID does not exist or is not registered'}, status=404)

            # Ensure the user exists within the specified plant
            users = plant_document.get('users', [])
            user = next((u for u in users if u['user_id'] == user_id), None)
            if not user:
                return JsonResponse({'status': 'error', 'message': f'User with ID {user_id} not found in the specified plant'}, status=404)

            # Return user details
            user_email = user.get('email')
            if not user_email:
                return JsonResponse({'status': 'error', 'message': 'User email not found'}, status=404)

            return JsonResponse({'status': 'success', 'email': user_email}, status=200)

        except json.JSONDecodeError:
            logger.error("Invalid JSON in the request body.")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON body'}, status=400)
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    # Return method not allowed for non-POST requests
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

""" 
name:Update user details
Discripion: This function updates a user's username and/or email based on their current email, and optionally sends a 
notification email about the changes, handling errors and invalid requests.
Input:
-request method:PUT
-input fields:plant_id, user_id, current_email, email,phone
Output:user updated successfully
"""
@csrf_exempt
def update_user_details(request):
    if request.method == 'PUT':
        try:
            # Load request data
            data = json.loads(request.body)
            user_id = data.get('user_id')  # user_id for identifying the user
            current_email = data.get('current_email')  # Optional: if user_id is not provided
            new_email = data.get('email')
            new_phone = data.get('phone')

            # Validate that either user_id or current_email is provided
            if not user_id and not current_email:
                return JsonResponse({'status': 'error', 'message': 'User ID or Current email is required'}, status=400)

            # Ensure that at least one of the fields (email or phone) is provided for update
            if not (new_email or new_phone):
                return JsonResponse({'status': 'error', 'message': 'At least one field (email or phone) is required to update'}, status=400)

            # Fetch user by user_id or email
            user = None
            if user_id:
                user = users_collection.find_one({'user_id': user_id})
            if not user and current_email:
                user = users_collection.find_one({'email': current_email})

            if not user:
                return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

            # Prepare update data
            update_data = {}
            if new_email and new_email != user.get('email'):
                # Validate the new email format
                if not is_valid_email(new_email):
                    return JsonResponse({'status': 'error', 'message': 'Invalid email format'}, status=400)
                update_data['email'] = new_email

            if new_phone and new_phone != user.get('phone'):
                update_data['phone'] = new_phone

            # If no changes are detected, inform the user
            if not update_data:
                return JsonResponse({'status': 'error', 'message': 'No changes detected'}, status=400)

            # Update user details in MongoDB
            query = {'user_id': user_id} if user_id else {'email': current_email}
            result = users_collection.update_one(query, {'$set': update_data})

            # Check if the update was successful
            if result.matched_count == 0:
                return JsonResponse({'status': 'error', 'message': 'No user updated'}, status=400)

            # Optionally send an email notification about the update
            send_mail(
                'Account Updated',
                f'Your account details have been updated.\n'
                f'New Email: {new_email if new_email else user["email"]}\n'
                f'New Phone: {new_phone if new_phone else user["phone"]}',
                'from@example.com',  # Replace with your valid sender email
                [new_email if new_email else current_email]
            )

            # Return success response
            return JsonResponse({'status': 'success', 'message': 'User updated successfully'})

        except json.JSONDecodeError:
            # Handle JSON decoding error
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            # Log unexpected errors for debugging
            logger.error(f'Error in update_user_details API: {str(e)}', exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    # If the request method is not PUT, return a 405 Method Not Allowed
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

"""
name: layout_Register
Description: Registers a new solar plant layout by validating and storing data into the database.
Input:
   - Request Method: POST
   - Request Body: PlantID,SmbCount,StringCount
Output: JSON response indicating success or error status, along with the stored data or an error message.
"""
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
"""
Name: get_details_by_plant_id
Description: Retrieves details of a solar plant by its PlantID, including SMB, String, and Panel details.
Input:
    - Request Method: GET
    - URL Parameter: plant_id 
    -input fields: not required
Output:JSON response with the plant details if found, or an error message if not.
"""
@csrf_exempt
def get_details_by_plant_id(request, plant_id):
    """
    Retrieve SMB, String, and Panel details for a given PlantID.
    """
    if request.method == 'GET':
        try:
            # Query MongoDB for the document with the given PlantID
            record = solar_plants_collection.find_one({'Plant_ID': plant_id}, {'_id': 0})  # Exclude MongoDB's _id field

            if not record:
                return JsonResponse({'status': 'error', 'message': f'No data found for PlantID: {plant_id}'}, status=404)

            # Assuming the fields you want to retrieve are 'PlantName', 'SMBCount', 'StringCount', 'PanelCount', etc.
            plant_details = {
                'PlantName': record.get('Plant_name', 'N/A'),
                'SMBCount': record.get('SMBCount', 0),
                'StringCount': record.get('StringCount', 0),
                'PanelCount': record.get('PanelCount', 0),
                # Add other fields as needed
            }

            # Return the plant details as JSON
            return JsonResponse({'status': 'success', 'data': plant_details}, status=200)

        except Exception as e:
            logger.exception("An unexpected error occurred")
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred: ' + str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
# =============================================================================================================================================

"""
Name: power_output
Description: This API generates and retrieves power output data for each SMB and its associated strings in a solar plant. 
It fetches plant-specific data (like SMBCount and StringCount) from the database, calculates power output for each string, 
and updates the MongoDB collection with the generated data.
Inputs:
    - Request Method: GET
    - Parameters:plant_id

Outputs:Generates the SMB and string ids and power output randomly
"""
@csrf_exempt
def power_output(request, plant_id):

    if request.method == 'GET':
        try:
            # Fetch plant data from the database
            plant_data = solar_plants_collection.find_one({"Plant_ID": plant_id})
            logger.debug(f"Fetched plant data: {plant_data}")

            if not plant_data:
                return JsonResponse({'status': 'error', 'message': f'Plant with ID {plant_id} not found.'}, status=400)

            # Extract and validate counts
            try:
                smb_count = int(plant_data.get("SMBCount", 0))
                string_count = int(plant_data.get("StringCount", 0))
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'SMBCount and StringCount must be integers.'}, status=400)

            if smb_count == 0 or string_count == 0:
                return JsonResponse({'status': 'error', 'message': f'Missing SMB or String counts for {plant_id}.'}, status=400)

            # Generate power output data (quick generation)
            updated_data = []
            for smb in range(1, smb_count + 1):
                smb_id = f"{smb}"  # Format SMB ID as SMB01, SMB02, etc.
                smb_data = {'smb_id': smb_id, 'strings': []}

                for string in range(1, string_count + 1):
                    string_id = f"{smb}.{string}"
                    voltage = random.uniform(0, 1500)
                    current = random.uniform(9, 10.5)
                    power_output = round((voltage * current) / 1000, 2)

                    smb_data['strings'].append({
                        'string_id': string_id,
                        'voltage': round(voltage, 2),
                        'current': round(current, 2),  
                        'power_output': power_output,
                    })

                updated_data.append(smb_data)

            # Store the generated data in the database
            power_output_collection.update_one(
                {"PlantID": plant_id},
                {'$set': {
                    "GeneratedData": updated_data,
                    "Timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                }},
                upsert=True
            )

            logger.debug(f"Updated data: {updated_data}")

            return JsonResponse({'status': 'success', 'data': updated_data}, status=200)

        except Exception as e:
            logger.exception("An unexpected error occurred.")
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

"""
Name: get_all_strings
Description: Retrieves all string data associated with the specified Plant_ID from the database. 
The function processes SMBs and their strings, evaluates their status based on voltage levels, 
and returns a detailed response containing string-level data.

Inputs:
    - Request Method: GET (other methods are not allowed).
    - URL Parameter:plant_id
Outputs:getting all string data related to specified plant that has provided in the request
"""
@csrf_exempt
def get_all_strings(request, plant_id):
    if request.method == 'GET':
        try:
            # Fetch SMB and string data for the specified Plant_ID
            plant_data = power_output_collection.find_one(
                {'PlantID': plant_id},
                {'_id': 0, 'GeneratedData': 1}  # Fetch only the GeneratedData field
            )

            if not plant_data or not plant_data.get('GeneratedData'):
                return JsonResponse(
                    {'status': 'error', 'message': f'No SMB data found for Plant_ID {plant_id}.'},
                    status=404
                )

            smb_data_list = plant_data['GeneratedData']
            all_strings_data = []

            # Process each SMB to extract strings and assign status
            for smb_data in smb_data_list:
                smb_id = smb_data['smb_id']
                strings = smb_data.get('strings', [])

                strings_list = []

                for string_data in strings:
                    string_id = string_data['string_id']
                    voltage = string_data.get('voltage', 0)
                    power_output = string_data.get('power_output', 0)

                    # Determine string status based on voltage
                    if voltage > 1000:
                        status = 'Online'
                    elif voltage >= 900 and voltage <= 1000:
                        status = 'Warning'
                    else:
                        status = 'Critical'

                    # Create the string data dictionary
                    string_summary = {
                        'SMB_ID': smb_id,
                        'String_ID': string_id,
                        'Voltage': round(voltage,2),
                        'Power_Output': round(power_output, 2),
                        'Status': status,
                        'timestamp': datetime.now().strftime('%d/%m/%Y %H:%M:%S')
                    }

                    # Append to the strings list for the current SMB
                    strings_list.append(string_summary)

                # Add the strings data to the all_strings_data under the current SMB
                all_strings_data.append({
                    'Strings': strings_list
                })

            # Store the collected string data under the PlantID
            string_collection.update_one(
                {'PlantID': plant_id},  # Search by PlantID
                {'$set': {'Strings_Data': all_strings_data, 'last_updated': datetime.now().strftime('%d/%m/%Y %H:%M:%S')}},
                upsert=True  # Upsert if no document is found with the PlantID
            )

            # Return the filtered strings data as a JSON response
            return JsonResponse({'status': 'success', 'PlantID': plant_id, 'Strings_Data': all_strings_data}, status=200)

        except PyMongoError as e:
            logger.exception(f"Database error occurred: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Database error: {str(e)}'}, status=500)
        except Exception as e:
            logger.exception(f"An unexpected error occurred: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)

    # Return a 405 error if the request method is not GET
    return JsonResponse({'status': 'error', 'message': 'Invalid request method. Only GET is allowed.'}, status=405)

"""
Name: get_smb_details_by_id
Description: Fetches details of a specific SMB (String Monitoring Box) within a plant by Plant_ID and SMB_ID.
The function retrieves and filters data from the database, returning the SMB details if found.
Inputs:
    - Request Method: GET (other methods are not allowed).
    - URL Parameters:plant_id, smb_id
Output:
"""
@csrf_exempt
def get_smb_details_by_id(request, plant_id, smb_id):
    if request.method == 'GET':
        try:
            # Fetch plant data from the database
            plant_data = power_output_collection.find_one({"PlantID": plant_id})
            logger.debug(f"Fetched plant data for PlantID {plant_id}: {plant_data}")

            if not plant_data:
                return JsonResponse({'status': 'error', 'message': f'Plant with ID {plant_id} not found.'}, status=404)

            # Extract SMB data for the given smb_id
            smb_data = next((smb for smb in plant_data.get("GeneratedData", []) if smb.get("smb_id") == smb_id), None)

            if not smb_data:
                return JsonResponse({'status': 'error', 'message': f'SMB with ID {smb_id} not found in Plant {plant_id}.'}, status=404)

            # Format the response as required
            response_data = {
                "status": "success",
                "data": [
                    {
                        "smb_id": smb_data.get("smb_id"),
                        "strings": smb_data.get("strings", [])
                    }
                ]
            }

            return JsonResponse(response_data, status=200)

        except Exception as e:
            logger.exception("An unexpected error occurred.")
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)


"""
name:get_all_smbs
Description: This function retrieves all SMB data for a given plant, processes it to generate a summary of each SMB (including string
count and total power output), and stores the summary in the database. The summary is then returned as a JSON response.
Parameters:
    - request: The HTTP request object.
    - url parameters: plant_id
Output: A response containing the SMB data summary, or an error message if any issues occur.
"""
@csrf_exempt
def get_all_smbs(request, plant_id):
    if request.method == 'GET':
        try:
            # Fetch SMB data for the given Plant_ID, excluding the _id field
            plant_data = power_output_collection.find_one(
                {'PlantID': plant_id},
                {'_id': 0, 'GeneratedData': 1}  # Exclude '_id' explicitly
            )

            if not plant_data or not plant_data.get('GeneratedData'):
                return JsonResponse(
                    {'message': 'No SMB data found for the given Plant_ID.'},
                    status=404
                )

            smb_data_list = plant_data['GeneratedData']
            smb_list = []

            for smb_data in smb_data_list:
                smb_id = smb_data['smb_id']
                strings = smb_data.get('strings', [])
                string_count = len(strings)

                # Sum up the power outputs for the strings of this SMB
                total_power_output = sum(
                    string.get('power_output', 0) for string in strings
                )

                total_current_output = sum(
                    string.get('current', 0) for string in strings
                )

                total_voltage_output = sum(
                    string.get('voltage', 0) for string in strings
                )

                # Generate random temperature value (e.g., between 20 and 40 degrees Celsius)
                random_temperature = round(random.uniform(20, 40), 2)

                smb_summary = {
                    'smb_id': smb_id,
                    'String_count': string_count,
                    'Power_output': round(total_power_output, 2),
                    'Current_output': round(total_current_output, 2),
                    'Voltage_output': round(total_voltage_output, 2),
                    'Temperature': random_temperature,  # Add the temperature value
                    'timestamp': datetime.now().strftime('%d/%m/%Y %H:%M:%S')  # User-friendly timestamp
                }
                smb_list.append(smb_summary)

            # Combine all SMB summaries into one document and upsert into the database
            combined_data = {
                'PlantID': plant_id,
                'smb_data': smb_list,
                'last_updated': datetime.now().strftime('%d/%m/%Y %H:%M:%S')  # Add a timestamp
            }

            smb_collection.update_one(
                {'PlantID': plant_id},
                {'$set': combined_data},
                upsert=True
            )

            # Return the summarized SMB data as a JSON response
            return JsonResponse({'status': 'success', 'smbs': smb_list}, status=200)

        except PyMongoError as e:
            # Handle database errors
            logger.exception(f"Database error occurred: {str(e)}")
            return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)
        except Exception as e:
            # Log the error with more detailed information
            logger.exception(f"An unexpected error occurred: {str(e)}")
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

    # If the method is not GET, return a 405 error
    return JsonResponse({'error': 'Invalid request method. Only GET is allowed.'}, status=405)

"""
Name: get_all_admins
Description:API to retrieve all admin records from the database.
Inputs:
    -Request Method: GET

Input Fields:None (no input is required for this API).

Output Fields:it will fetch all admins who are registered irrespective of plant
"""
@csrf_exempt
def get_all_admins(request):
    if request.method == 'GET':
        try:
            logger.info("GET request received to retrieve all admins.")

            # Fetch all admin documents from the admin collection
            admins = list(admin_collection.find()) # You can choose which fields to retrieve

            # Convert the cursor to a list
            admin_list = []
            for admin in admins:
                admin_data = {
                    '_id': str(admin['_id']),
                    'PlantID': admin.get('Plant_ID'),
                    'user_id': admin.get('user_id'),
                    'email': admin.get('email'),
                    'phone_number': admin.get('phone_number')
                }
                admin_list.append(admin_data)
            logger.info(f"Retrieved {len(admin_list)} admins.")

            return JsonResponse({'admins': admin_list}, status=200, safe=False)

        except PyMongoError as e:
            logger.error(f"Database error occurred: {e}")
            return JsonResponse({'error': f'Database error occurred: {str(e)}'}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    else:
        logger.warning("Invalid request method used.")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

"""
Name: update_admin
Description: API to update the details of an admin based on the provided Plant ID and user_id.
Inputs:
    -Request Method: PUT
    -Parameters:Plant_id,user_id, email, Phone_number
Output Fields:Admin details updated succesfully
        
"""
@csrf_exempt
def update_admin(request, plant_id):
    if request.method == 'PUT':
        try:
            logger.info(f"Admin update PUT request received for Plant ID: {plant_id}")

            # Parse incoming JSON data
            data = json.loads(request.body)
            user_id = data.get('user_id')
            email_id = data.get('email')
            phone_number = data.get('phone_number')
        

            # Validate input fields
            if not user_id:
                logger.warning("Admin ID is required but missing.")
                return JsonResponse({'status': 'error', 'message': 'Admin ID is required.'}, status=400)

            # Validate email format if email_id is provided
            if email_id and not is_valid_email(email_id):
                logger.warning(f"Invalid email format: {email_id}")
                return JsonResponse({'status': 'error', 'message': 'Invalid email format.'}, status=400)

            # Validate phone number format if phone_number is provided
            if phone_number and (len(phone_number) != 12 or not phone_number.isdigit()):
                logger.warning(f"Invalid phone number: {phone_number}")
                return JsonResponse({'status': 'error', 'message': 'Phone number must be 10 digits.'}, status=400)

            # Check if the admin exists for the given Plant_ID
            try:
                admin = admin_collection.find_one({'user_id': user_id, 'Plant_ID': plant_id})
            except Exception as e:
                logger.error(f"Invalid admin ID or Plant ID format: {user_id}, error: {e}")
                return JsonResponse({'status': 'error', 'message': 'Invalid admin ID or Plant ID format.'}, status=400)

            if not admin:
                logger.warning(f"Admin not found with ID: {user_id} and Plant ID: {plant_id}")
                return JsonResponse({'status': 'error', 'message': 'Admin not found.'}, status=404)

            # Prepare fields to update, excluding unchanged fields
            update_fields = {}
            if email_id and email_id != admin.get('email'):
                update_fields['email'] = email_id
            if phone_number and phone_number != admin.get('phone_number'):
                update_fields['phone_number'] = phone_number

            if not update_fields:
                logger.info("No changes detected for the admin update.")
                return JsonResponse({'status': 'error', 'message': 'No changes detected.'}, status=400)

            # Perform the update operation
            result = admin_collection.update_one(
                {'user_id': user_id, 'Plant_ID': plant_id},
                {'$set': update_fields}
            )

            if result.matched_count == 0:
                logger.warning(f"Update failed for admin ID: {user_id} and Plant ID: {plant_id}")
                return JsonResponse({'status': 'error', 'message': 'No admin updated.'}, status=400)

            logger.info(f"Admin details updated successfully for ID: {user_id} and Plant ID: {plant_id}")
            return JsonResponse({'status': 'success', 'message': 'Admin details updated successfully.'}, status=200)

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format.'}, status=400)

        except Exception as e:
            logger.error(f"Unexpected error in update_admin API: {e}", exc_info=True)
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)

    else:
        logger.warning("Invalid request method for update_admin.")
        return JsonResponse({'status': 'error', 'message': 'Method not allowed.'}, status=405)

"""
Name: delete_admin
Description: API to delete an admin record from the database based on the provided PlantID and user_id.
Input Field:
    -Request Method: DELETE
    -Parameters:plant_id,user_id 
Output Fields:admin deleted successfully
"""
@csrf_exempt
def delete_admin(request):

    if request.method == 'DELETE':
        try:
            # Parse JSON body
            data = json.loads(request.body)
            plant_id = data.get('plant_id')
            user_id = data.get('user_id')

            # Find and delete the admin by Plant_ID and username
            result = admin_collection.delete_one({'PlantID': plant_id, 'user_id': user_id})
            if result.deleted_count == 0:
                return JsonResponse({'status': 'error', 'message': 'Admin not found'}, status=404)

            return JsonResponse({'status': 'success', 'message': 'Admin deleted successfully'})

        except Exception as e:
            logger.error(f'Error in delete_Admin API: {str(e)}', exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

"""
Description: In these function we are genrating the random Alert_id
"""
def get_next_alert_id():
    """Generate the next alert ID based on the highest existing alert ID in the database."""
    last_alert = alerts_collection.find_one(sort=[("alertID", -1)])  # Find the last inserted document
    if last_alert and "alertID" in last_alert:
        try:
            last_id = int(last_alert["alertID"][3:])  # Extract numeric part after "ALT"
            next_id = last_id + 1
        except ValueError:
            next_id = 1  # Default to 1 if extraction fails
    else:
        next_id = 1  # Start from ALT001 if no alerts exist yet
    return next_id  # Return the integer (not a string)


"""
Name: active_alerts
Description: This API generates and retrieves active alerts for SMBs and their associated strings in a solar power plant. 
Each alert includes details like SMB ID, STRING ID, alert type, severity level, timestamp, and required actions. The data is 
stored in MongoDB and returned as a response.

Inputs:
    - Request Method: GET (other methods are not allowed).
    - No additional query parameters required.

Outputs:unique serialized id generated for alert

"""
@csrf_exempt
def active_alerts(request, plant_id):
    try:
        if request.method != 'GET':
            return JsonResponse({"error": "Only GET method is allowed"}, status=400)

        if not plant_id:
            return JsonResponse({"error": "Plant ID is required"}, status=400)

        # Fetch SMB count and String count from solar_plants_collection
        plant_data = solar_plants_collection.find_one({"Plant_ID": plant_id})

        if not plant_data:
            return JsonResponse({"error": f"No plant found with ID {plant_id}"}, status=404)

        smb_count = int(plant_data.get("SMBCount", 0))
        string_count = int(plant_data.get("StringCount", 0))

        if smb_count <= 0 or string_count <= 0:
            return JsonResponse({"error": "Invalid SMB or String count for the plant"}, status=400)

        # Check if alerts data already exists for the given plant_id
        existing_alerts = alerts_collection.find_one({"plant_id": plant_id})
        if existing_alerts:
            return JsonResponse({
                "plant_id": plant_id,
                "alerts": existing_alerts["GeneratedData"],
            }, status=200)

        alerts = []
        alert_names = ["Dust", "Bird waste", "Crack", "Voltage Fluctuation"]

        actions_required_mapping = {
            "Dust": "Cleaning",
            "Bird waste": "Cleaning",
            "Crack": "Repair",
            "Voltage Fluctuation": "Contact Operator"
        }

        severity_levels = ["Online", "Warning", "Critical"]

        # Create string mapping for each SMB
        smb_ids = [str(i) for i in range(1, smb_count + 1)]
        string_mapping = {
            smb_id: [f"{smb_id}.{j}" for j in range(1, string_count + 1)]
            for smb_id in smb_ids
        }

        # Get the starting alert ID number
        next_alert_number = get_next_alert_id()

        for _ in range(25):
            smb_id = random.choice(smb_ids)
            alert_name = random.choice(alert_names)

            alert_data = {
                "alertID": f"ALT{next_alert_number:03d}",  # Properly formatted unique ID
                "SMB_ID": smb_id,
                "STRING_ID": random.choice(string_mapping[smb_id]),
                "alert_name": alert_name,
                "severity_level": random.choice(severity_levels),
                "time_detected": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                "action_required": actions_required_mapping[alert_name],
                "status": random.choice(["Complete", "Incomplete"]),
            }

            alerts.append(alert_data)
            next_alert_number += 1  # Increment alert ID for the next one

        # Prepare the data to insert into the database
        plant_alert_data = {
            "plant_id": plant_id,
            "GeneratedData": alerts,
            "Timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        }

        # Insert the new alert data into the collection
        alerts_collection.insert_one(plant_alert_data)

        return JsonResponse({
            "plant_id": plant_id,
            "alerts": alerts
        }, status=200)

    except Exception as e:
        print("Error occurred:", str(e))
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)

"""
Name: alert_history
Description: Retrieves or generates the alert history for a given plant ID.
Input:
    - Request Method: GET
    - url parameters: plant_id
    - Fields:No input fields
Output:JSON response containing the alert history if available or newly generated alert history.

"""
@csrf_exempt
def alert_history(request, plant_id):
    try:
        if request.method != 'GET':
            return JsonResponse({"error": "Only GET method is allowed"}, status=400)

        # Fetch existing alert history data for the given plant_id
        history_collection = alert_history_collection
        existing_history_data = history_collection.find_one({"plant_id": plant_id})

        if existing_history_data:
            # Convert ObjectId to string for serialization
            existing_history_data['_id'] = str(existing_history_data['_id'])
            # Return the existing alert history data
            return JsonResponse(existing_history_data, status=200)

        # Fetch alerts from the original collection for the given plant_id
        collection = alerts_collection
        existing_alert_data = collection.find_one({"plant_id": plant_id})

        if not existing_alert_data:
            return JsonResponse({"message": "No alerts found for this plant_id"}, status=200)

        # If alert data exists, use it; otherwise, return a message indicating no alerts
        alerts = existing_alert_data.get("GeneratedData", [])

        if not alerts:
            return JsonResponse({"message": "No generated alerts found for this plant_id"}, status=200)

        # Add the 'status' field to each alert
        statuses = ["incomplete", "success"]
        history_alerts = []

        for index, alert in enumerate(alerts):
            alert_copy = alert.copy()  # Create a copy of the alert to modify
            
            # Generate a unique alertID (if necessary) by appending index to it
            alert_copy['alertID'] = f"ALT{index+1:03d}"

            # Do not copy _id field from the original alert as MongoDB will generate a new _id
            if '_id' in alert_copy:
                del alert_copy['_id']  # Remove the _id field if it exists
            
            alert_copy['status'] = random.choice(statuses)  # Assign a random status
            history_alerts.append(alert_copy)  # Append to the list of history alerts

        # Insert all alerts as one document in the history collection
        alert_history_data = {
            "plant_id": plant_id,
            "GeneratedData": history_alerts,
            "Timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        }
        result = history_collection.insert_one(alert_history_data)

        # Convert _id to string before sending in response
        alert_history_data['_id'] = str(result.inserted_id)

        # Return the alert history as a JSON response
        return JsonResponse(alert_history_data, status=200)

    except errors.ServerSelectionTimeoutError as db_err:
        return JsonResponse({"error": "Database connection failed", "details": str(db_err)}, status=500)
    except errors.PyMongoError as db_err:
        return JsonResponse({"error": "Database operation failed", "details": str(db_err)}, status=500)
    except Exception as e:
        print("Error occurred:", str(e))
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)

"""
Name: energy_data
Description: Retrieves energy data for a specified frequency and SMB ID, filtering records accordingly.
Input:
    - Request Method: GET
    - Input Fields:
        - frequency (string): Must be one of ["daily", "weekly", "monthly", "yearly"].
        - smb_id (string): Identifies the specific SMB for which data is requested.
Output:
    - JSON response containing energy data filtered by the given frequency and smb_id.
    - Returns an error message if parameters are invalid or an exception occurs.
"""
@csrf_exempt
def energy_data(request, frequency, smb_id):
    if request.method == 'GET':
        try:
            # Validate frequency
            if frequency not in ["daily", "weekly", "monthly", "yearly"]:
                return JsonResponse({"status": "error", "message": "Invalid frequency parameter"}, status=400)

            # Validate smb_id
            if not smb_id:
                return JsonResponse({"status": "error", "message": "Missing smb_id parameter"}, status=400)

            # Query the data using $elemMatch to find documents that contain the specific smb_id in the data array
            query = {
                "frequency": frequency,
                "data.smb_id": smb_id  # This ensures we find only the record with the exact smb_id
            }

            logger.info(f"Querying MongoDB with: {query}")

            # Query the data from the collection
            data = analytics_collection.find(query)
            records = list(data)
            logger.info(f"Number of records found: {len(records)}")

            # Prepare and serialize the response
            result = []
            for record in records:
                # Flatten the data by removing smb_id redundancy and group the data by `key` (year, month, week, etc.)
                for entry in record.get("data", []):
                    # Only include data related to the requested smb_id
                    if entry.get("smb_id") == smb_id:
                        # Prepare the response without repeating smb_id
                        result.append({
                            "key": entry.get("key"),
                            "data": entry.get("data")
                        })

            return JsonResponse({"status": "success", "data": result}, status=200)

        except Exception as e:
            logger.exception("An error occurred while fetching energy data.")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

"""
Name: upcoming_maintenance
Description: Retrieves and updates the upcoming maintenance tasks for a given solar plant. If the plant has fewer than 30 tasks, new tasks are generated and added.
Input:
    - Request Method: GET
    - Input Fields:
        - plant_id (string): Unique identifier for the solar plant.
Output:
    - JSON response containing the list of maintenance tasks for the specified plant.
    - If the plant already has 30 tasks, no new tasks are added.
    - Returns an error message if the plant_id is invalid or an exception occurs.
"""
@csrf_exempt
def upcoming_maintenance(request, plant_id):  # Directly use plant_id passed to the view
    try:
        if request.method != 'GET':
            logger.warning(f"Invalid method: {request.method} for plant_id: {plant_id}")
            return JsonResponse({"error": "Only GET method is allowed"}, status=400)

        # Check if the plant_id exists in the solar_plant_collection
        plant = solar_plants_collection.find_one({"Plant_ID": plant_id})
        if not plant:
            logger.warning(f"Invalid plant_id: {plant_id} not found in solar_plant_collection.")
            return JsonResponse({"error": "Invalid plant ID"}, status=400)

        logger.info(f"Found plant with ID: {plant_id}. Preparing maintenance tasks.")

        # Check if a maintenance document exists for the plant
        maintenance_doc = maintenance_tasks_collection.find_one({"Plant_ID": plant_id})

        # If maintenance document exists, check the number of existing tasks
        if maintenance_doc:
            existing_tasks = maintenance_doc.get("tasks", [])
            task_count = len(existing_tasks)

            if task_count >= 30:
                logger.info(f"Plant {plant_id} already has 30 tasks. No new tasks will be added.")
                return JsonResponse(
                    {
                        "Plant_ID": plant_id,
                        "message": "No new tasks were added. Maximum of 30 tasks already exists.",
                        "tasks": existing_tasks,
                    },
                    status=200,
                    safe=False,
                )
        else:
            existing_tasks = []
            task_count = 0

        # Generate new tasks to fill up to 30 tasks
        task_names = ["Panel Cleaning", "Inverter Inspection", "Cable Check", "SMB Maintenance", "Voltage Calibration"]
        status = "Scheduled"  # Fixed status for all tasks

        new_tasks = []  # Tasks to be added to the existing tasks list
        for i in range(task_count + 1, 31):  # Fill up to 30 tasks
            task_id = f"TASK{str(i).zfill(4)}"  # TASK0001, TASK0002, ...
            task_name = random.choice(task_names)
            schedule_date = (datetime.now() + timedelta(days=random.randint(5, 15))).strftime("%d/%m/%Y")
            task_description = f"Description for {task_name} scheduled on {schedule_date}"

            task = {
                "task_ID": task_id,
                "task_name": task_name,
                "schedule_date": schedule_date,
                "status": status,
                "task_description": task_description,
            }
            new_tasks.append(task)

        # Add the new tasks to the existing tasks
        all_tasks = existing_tasks + new_tasks

        if maintenance_doc:
            # Update the existing document with new tasks
            maintenance_tasks_collection.update_one(
                {"Plant_ID": plant_id}, {"$set": {"tasks": all_tasks}}
            )
            logger.info(f"Updated maintenance tasks for plant {plant_id}.")
        else:
            # Create a new document for the plant with the tasks
            maintenance_tasks_collection.insert_one(
                {"Plant_ID": plant_id, "tasks": all_tasks}
            )
            logger.info(f"Created new maintenance document for plant {plant_id}.")

        # Return the tasks under the plant_id
        response = {
            "Plant_ID": plant_id,
            "tasks": all_tasks,  # Include all tasks under the "tasks" key
        }

        logger.info(f"Successfully handled {len(new_tasks)} new tasks for plant {plant_id}.")
        return JsonResponse(response, status=200, safe=False)

    except Exception as e:
        logger.error(f"An unexpected error occurred for plant {plant_id}: {str(e)}")
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)

"""
Name: update_maintenance_task
Description: Updates a specific maintenance task for a given plant and task ID.
Input:
    - Request Method: PUT
    - URL Parameters:plant_id, task_id
    - input fields:task_name, task_description
Output:JSON response indicating success or error, including details if applicable.

"""
@csrf_exempt
def update_maintenace_task(request, plant_id, task_id):
    try:
        if request.method != 'PUT':
            logger.warning(f"Invalid method: {request.method} for plant_id: {plant_id}, task_id: {task_id}")
            return JsonResponse({"error": "Only PUT method is allowed for this endpoint."}, status=400)

        # Parse the request body
        body = json.loads(request.body.decode('utf-8'))
        task_name = body.get("task_name")
        task_description = body.get("task_description")

        if not task_name and not task_description:
            logger.warning(f"No valid fields provided for update for task {task_id} in plant {plant_id}.")
            return JsonResponse({"error": "At least one field (task_name or task_description) must be provided."}, status=400)

        # Check if the plant_id exists in the maintenance_tasks_collection
        maintenance_doc = maintenance_tasks_collection.find_one({"Plant_ID": plant_id})
        if not maintenance_doc:
            logger.warning(f"Plant_ID {plant_id} not found in maintenance_tasks_collection.")
            return JsonResponse({"error": "Invalid plant ID"}, status=400)

        # Locate the specific task within the plant's maintenance document
        task_exists = any(task["task_ID"] == task_id for task in maintenance_doc.get("tasks", []))
        if not task_exists:
            logger.warning(f"Task {task_id} not found for plant {plant_id}.")
            return JsonResponse({"error": f"Task {task_id} not found for plant {plant_id}."}, status=404)

        # Update the task fields
        update_fields = {}
        if task_name:
            update_fields["tasks.$.task_name"] = task_name
        if task_description:
            update_fields["tasks.$.task_description"] = task_description

        maintenance_tasks_collection.update_one(
            {"Plant_ID": plant_id, "tasks.task_ID": task_id},
            {"$set": update_fields}
        )
        logger.info(f"Updated task {task_id} for plant {plant_id} with fields: {update_fields}.")
        return JsonResponse({'status': 'success',"message": f"Task {task_id} updated successfully."}, status=200)

    except Exception as e:
        logger.error(f"An unexpected error occurred for plant {plant_id}, task {task_id}: {str(e)}")
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)

"""
Name: maintenance_task_complete
Description: Marks a specific maintenance task as completed and moves it to the maintenance history collection.
Input:
     - Request Method: POST
     - URL Parameters: plant_id, task_id
Output:JSON response indicating success or error, including details if applicable.

"""
@csrf_exempt
def maintenance_task_complete(request, plant_id, task_id):
    try:
        if request.method != 'POST':
            logger.warning(f"Invalid method: {request.method} for plant_id: {plant_id}, task_id: {task_id}")
            return JsonResponse({"error": "Only POST method is allowed for this endpoint."}, status=400)

        # Check if the plant_id exists in the maintenance_tasks_collection
        maintenance_doc = maintenance_tasks_collection.find_one({"Plant_ID": plant_id})
        if not maintenance_doc:
            logger.warning(f"Plant_ID {plant_id} not found in maintenance_tasks_collection.")
            return JsonResponse({"error": "Invalid plant ID"}, status=400)

        # Locate the specific task within the plant's maintenance document
        task_index = next((index for (index, task) in enumerate(maintenance_doc.get("tasks", [])) if task["task_ID"] == task_id), None)
        if task_index is None:
            logger.warning(f"Task {task_id} not found for plant {plant_id}.")
            return JsonResponse({"error": f"Task {task_id} not found for plant {plant_id}."}, status=404)

        # Retrieve the task and remove it from the tasks list
        task_to_complete = maintenance_doc["tasks"].pop(task_index)

        # Add the "completed_date" field and update the status of the task
        task_to_complete["completed_date"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        task_to_complete["status"] = "completed"  # Update the status to "completed"

        # Check if a history document already exists for the plant
        history_doc = maintenance_history_collection.find_one({"Plant_ID": plant_id})
        if history_doc:
            # Append the task to the existing document
            maintenance_history_collection.update_one(
                {"Plant_ID": plant_id},
                {"$push": {"tasks": task_to_complete}}
            )
            logger.info(f"Task {task_id} for plant {plant_id} added to existing maintenance_history_collection document.")
        else:
            # Create a new document for the plant in the history collection
            new_history_doc = {
                "Plant_ID": plant_id,
                "tasks": [task_to_complete]
            }
            maintenance_history_collection.insert_one(new_history_doc)
            logger.info(f"Task {task_id} for plant {plant_id} added to a new maintenance_history_collection document.")

        # Update the maintenance_tasks_collection
        maintenance_tasks_collection.update_one(
            {"Plant_ID": plant_id},
            {"$set": {"tasks": maintenance_doc["tasks"]}}
        )
        logger.info(f"Task {task_id} removed from maintenance_tasks_collection for plant {plant_id}.")

        return JsonResponse({'status': 'success',"message": f"Task {task_id} marked as completed and moved to history."}, status=200)

    except Exception as e:
        logger.error(f"An unexpected error occurred for plant {plant_id}, task {task_id}: {str(e)}")
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)
    
"""
Name: maintenance_history
Description: Retrieves the maintenance history for a specific plant or all plants.
Input:
   - Request Method: GET
   - URL Parameters:Plant_id
Output:JSON response with maintenance history or error message.

"""
@csrf_exempt
def maintenance_history(request, plant_id):
    try:
        if request.method == 'GET':
            # Fetch the maintenance history for the specific plant_id if provided
            if plant_id:
                history_doc = maintenance_history_collection.find_one({"Plant_ID": plant_id}, {"_id": 0})
                if history_doc:
                    logger.info(f"Retrieved maintenance history for Plant_ID {plant_id}.")
                    return JsonResponse(history_doc, safe=False, status=200)
                else:
                    logger.warning(f"No maintenance history found for Plant_ID {plant_id}.")
                    return JsonResponse({"error": "No maintenance history found for the specified plant."}, status=404)
            else:
                # Fetch all maintenance history documents if no plant_id is specified
                history_docs = list(maintenance_history_collection.find({}, {"_id": 0}))
                if history_docs:
                    logger.info("Retrieved all maintenance history records.")
                    return JsonResponse(history_docs, safe=False, status=200)
                else:
                    logger.warning("No maintenance history records found.")
                    return JsonResponse({"error": "No maintenance history records found."}, status=404)

        else:
            logger.warning(f"Invalid method: {request.method}. Only GET is allowed.")
            return JsonResponse({"error": "Only GET method is allowed for this endpoint."}, status=400)

    except Exception as e:
        logger.error(f"An unexpected error occurred while fetching maintenance history: {str(e)}")
        return JsonResponse({"error": "An unexpected error occurred", "details": str(e)}, status=500)


"""
Name: generate_analytics_data
Description: Generates real-time and expected analytics data for a specific SMB within a solar plant.
Input:
    - Request Method: GET
    - URL Parameters: plant_id, smb_id
Output: JSON response containing generated real-time data and expected data for the specified SMB.
"""
@csrf_exempt
def generate_analytics_data(request, plant_id, smb_id):
    try:
        # Get the current time in Asia/Kolkata timezone
        kolkata_timezone = pytz.timezone("Asia/Kolkata")
        current_time = datetime.now(kolkata_timezone)

        # Fetch plant data from solar_plants_collection
        plant_data = solar_plants_collection.find_one({'Plant_ID': plant_id})
        if not plant_data:
            return JsonResponse({'error': 'Plant not found'}, status=404)

        smb_count = int(plant_data.get('SMBCount', 0))  # Get SMBCount from the plant document
        if smb_count == 0:
            return JsonResponse({'error': 'No SMBs found for this plant'}, status=404)

        # Fetch SMB data from smb_collection for the given plant_id
        plant_smb_data = smb_collection.find_one({'PlantID': plant_id}, {'smb_data': 1})
        if not plant_smb_data or 'smb_data' not in plant_smb_data:
            return JsonResponse({'error': 'No SMB data found for this plant'}, status=404)

        # Extract the correct SMB entry from the list
        smb_data = next((smb for smb in plant_smb_data['smb_data'] if smb.get('smb_id') == smb_id), None)
        if not smb_data:
            return JsonResponse({'error': f'SMB {smb_id} not found for this plant'}, status=404)

        # Generate real-time data
        daily_time_slots = [(current_time - timedelta(hours=i)).strftime('%I %p') for i in range(5)]
        daily_data = [{'time': time_slot, 'energy': random.randint(10, 25), 'temperature': random.randint(10, 25)} for time_slot in daily_time_slots]

        weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_data = [{'time': weekdays[i % 7], 'energy': random.randint(100, 250), 'temperature': random.randint(10, 25)} for i in range(7)]

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_data = [{'time': month, 'energy': random.randint(100, 250), 'temperature': random.randint(10, 25)} for month in month_names]

        yearly_data = [{'time': str(year), 'energy': random.randint(1000, 2500), 'temperature': random.randint(10, 25)} for year in range(2023, current_time.year + 1)]

        # Generate expected data for the future (next 2 years)
        expected_years = [str(year) for year in range(current_time.year + 1, current_time.year + 3)]
        expected_data = {
            'Daily': [{'time': f"{(current_time + timedelta(days=i)).strftime('%I %p')}", 'energy': random.randint(10, 25), 'temperature': random.randint(10, 25)} for i in range(30)],
            'Weekly': [{'time': f"Week {i+1}", 'energy': random.randint(100, 250), 'temperature': random.randint(10, 25)} for i in range(52)],
            'Monthly': [{'time': month_names[i], 'energy': random.randint(100, 250), 'temperature': random.randint(10, 25)} for i in range(12)],
            'Yearly': [{'time': year, 'energy': random.randint(1000, 2500), 'temperature': random.randint(10, 25)} for year in expected_years]
        }

        real_time_data = {
            'Daily': daily_data[::1],
            'Weekly': weekly_data[::1],
            'Monthly': monthly_data[::1],
            'Yearly': yearly_data[::1]
        }

        smb_final_data = {
            'smb_id': smb_data['smb_id'],
            'Power_output': smb_data['Power_output'],
            'timestamp': smb_data['timestamp'],
            'real_time_data': real_time_data,
            'expected_data': expected_data
        }

        # Check if smb_id exists in analytics_collection
        existing_analytics = analytics_collection.find_one(
            {'plant_id': plant_id, 'smb_data.smb_id': smb_id}
        )

        if existing_analytics:
            # If smb_id exists, update only the required fields
            analytics_collection.update_one(
                {'plant_id': plant_id, 'smb_data.smb_id': smb_id},
                {'$set': {
                    'timestamp': current_time.timestamp(),
                    'smb_data.$.real_time_data': smb_final_data['real_time_data'],
                    'smb_data.$.expected_data': smb_final_data['expected_data']
                }}
            )
        else:
            # If smb_id does not exist, push a new SMB entry into smb_data array
            analytics_collection.update_one(
                {'plant_id': plant_id},
                {'$push': {
                    'smb_data': {
                        'smb_id': smb_id,
                        'Power_output': smb_data['Power_output'],
                        'timestamp': smb_data['timestamp'],
                        'real_time_data': smb_final_data['real_time_data'],
                        'expected_data': smb_final_data['expected_data']
                    }
                }},
                upsert=True
            )

        return JsonResponse({'status': 'success', 'generated_data': smb_final_data})

    except Exception as e:
        return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)

def get_min_max_dates():
    """
    Query the collection to get the minimum and maximum dates available in the data.
    This function assumes that each document in historical_collection contains a list
    under "historical_data" with "date" fields in "YYYY-MM-DD" format.
    """
    min_date_doc = historical_collection.find_one(
        {}, {"historical_data": 1}, sort=[("historical_data.date", 1)]
    )
    max_date_doc = historical_collection.find_one(
        {}, {"historical_data": 1}, sort=[("historical_data.date", -1)]
    )

    # Ensure the documents exist
    if not min_date_doc or not max_date_doc:
        raise ValueError("No date records found in historical_data collection.")

    # Extract date from historical_data list (assuming it's a list of dictionaries)
    min_date_list = min_date_doc.get("historical_data", [])
    max_date_list = max_date_doc.get("historical_data", [])

    # Check if the list is empty
    if not min_date_list or not max_date_list:
        raise ValueError("No valid date records found in historical_data.")

    # Extract the first available date
    min_date = min_date_list[0].get("date") if isinstance(min_date_list, list) else None
    max_date = max_date_list[-1].get("date") if isinstance(max_date_list, list) else None

    if not min_date or not max_date:
        raise ValueError("No valid date found in historical_data documents.")

    return min_date, max_date


def format_report_date(date_str, report_type):
    """Formats date based on report type."""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    
    if report_type.lower() == "monthly":
        return date_obj.strftime("%B %Y")  # e.g., "January 2023"
    elif report_type.lower() == "yearly":
        return date_obj.strftime("%Y")  # e.g., "2023"
    elif report_type.lower() == "weekly":
        start_of_week = date_obj - timedelta(days=date_obj.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)  # Sunday
        return f"{start_of_week.strftime('%d %b %Y')} - {end_of_week.strftime('%d %b %Y')}"
    
    # Default case for daily or any unhandled report type
    return date_str

def aggregate_data(entries):
    """
    Aggregates SMB data for reports.
    Expects entries to be a list of dictionaries with keys such as:
    "current_real", "current_expected", "voltage_real", "voltage_expected", and "temperature".
    """
    if not entries:
        return {}
    
    total_entries = len(entries)
    aggregated = {}
    
    for key in ["current_real", "current_expected", "voltage_real", "voltage_expected", "temperature"]:
        total_value = sum(entry.get(key, 0) for entry in entries)
        aggregated[key] = round(total_value / total_entries, 2)
    
    return aggregated

def generate_report(start_date, end_date, report_type, data_type, smbs=None):
    """Generates reports for SMBs based on the requested type."""
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Build queries based on the date range.
    query = {
        "historical_data.date": {
            "$gte": start_date_obj.strftime("%Y-%m-%d"), 
            "$lte": end_date_obj.strftime("%Y-%m-%d")
        }
    }
    analytics_data = list(historical_collection.find(query, {"_id": 0, "historical_data": 1}))
    
    alert_query = {
        "generated_alert_data.date": {
            "$gte": start_date_obj.strftime("%Y-%m-%d"), 
            "$lte": end_date_obj.strftime("%Y-%m-%d")
        }
    }
    faults_data = list(faults_collection.find(alert_query, {"_id": 0, "generated_alert_data": 1}))
    
    # Check if the requested type of data exists.
    if data_type == "analytics" and not analytics_data:
        return {"error": f"No analytics data found for {start_date_obj.date()} to {end_date_obj.date()}"}
    if data_type == "faults" and not faults_data:
        return {"error": f"No faults data found for {start_date_obj.date()} to {end_date_obj.date()}"}
    if data_type == "all" and (not analytics_data and not faults_data):
        return {"error": f"No data found for {start_date_obj.date()} to {end_date_obj.date()}"}
    
    # Prepare a nested dictionary to store data per SMB and per formatted date.
    report_data = defaultdict(lambda: defaultdict(lambda: {"faults": [], "analytics": []}))
    found_smbs = set()
    smbs_set = set(smbs) if smbs else None
    
    # Process analytics data if required.
    if data_type in ["analytics", "all"]:
        for record in analytics_data:
            for historical_record in record.get("historical_data", []):
                record_date = historical_record.get("date")
                if not (start_date_obj.strftime("%Y-%m-%d") <= record_date <= end_date_obj.strftime("%Y-%m-%d")):
                    continue
                
                formatted_date = format_report_date(record_date, report_type)
                for smb in historical_record.get("smbs", []):
                    smb_id = smb.get("smb_id")
                    if smbs_set and smb_id not in smbs_set:
                        continue
                    found_smbs.add(smb_id)
                    
                    # For aggregatable report types, collect raw data points.
                    if report_type.lower() in ["weekly", "monthly", "yearly"]:
                        report_data[smb_id][formatted_date]["analytics"].extend(smb.get("data", []))
                    else:
                        # For daily reports, use data as provided.
                        report_data[smb_id][formatted_date]["analytics"] = smb.get("data", [])
    
    # Process faults data if required.
    if data_type in ["faults", "all"]:
        for fault in faults_data:
            for fault_record in fault.get("generated_alert_data", []):
                alert_date = fault_record.get("date")
                if not (start_date_obj.strftime("%Y-%m-%d") <= alert_date <= end_date_obj.strftime("%Y-%m-%d")):
                    continue
                
                formatted_date = format_report_date(alert_date, report_type)
                smb_id = fault_record.get("smb_id")
                if smbs_set and smb_id not in smbs_set:
                    continue
                found_smbs.add(smb_id)
                report_data[smb_id][formatted_date]["faults"].append({
                    "alertID": fault_record.get("alertID"),
                    "alert_name": fault_record.get("alert_name"),
                    "severity_level": fault_record.get("severity_level"),
                    "action_required": fault_record.get("action_required"),
                    "status": fault_record.get("status")
                })
    
    # For weekly, monthly, and yearly reports, aggregate the collected analytics data.
    if report_type.lower() in ["weekly", "monthly", "yearly"] and data_type in ["analytics", "all"]:
        for smb_id, date_dict in report_data.items():
            for date_key, values in date_dict.items():
                raw_analytics = values.get("analytics", [])
                if raw_analytics:
                    values["analytics"] = [aggregate_data(raw_analytics)]
    
    final_result = {
        "status": "success",
        "report_data": [
            {
                "smb_id": smb_id,
                "data": [
                    {
                        "date": date,
                        "faults": values["faults"],
                        "analytics": values["analytics"]
                    }
                    for date, values in smb_data.items()
                ]
            }
            for smb_id, smb_data in report_data.items()
        ]
    }
    
    # If specific SMBs were requested, verify that data was found for all of them.
    if smbs:
        missing_smbs = [smb_id for smb_id in smbs if smb_id not in found_smbs]
        if missing_smbs:
            return {"error": f"Data not found for SMB IDs: {missing_smbs}"}
    
    return final_result

"""
Name: report_generation
Description: Generates reports for the specified date range, report type, and data type. Supports SMB-specific filtering and allows users to generate analytics, faults, or combined data.
Input:
    - Request Method: POST
    - Request Body (JSON format): start_date, end_date, report_type, data_type, smbs
output: 
    - JSON response containing the generated report or error message.
    - Returns error messages for invalid input, missing data, or server errors.
"""
@csrf_exempt
def report_generation(request):
    """Handles API request for generating reports."""
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
    
    try:
        body_data = json.loads(request.body)
        # "smbs" is optional.
        required_fields = ['start_date', 'end_date', 'report_type', 'data_type']
        if not all(field in body_data for field in required_fields):
            return JsonResponse({"error": "Missing required parameters."}, status=400)
        
        start_date, end_date, report_type, data_type = (body_data[field] for field in required_fields)
        smbs = body_data.get('smbs', [])
        
        if report_type not in ["Daily", "Weekly", "Monthly", "Yearly"]:
            return JsonResponse({"error": "Invalid report type."}, status=400)
        if data_type not in ["analytics", "faults", "all"]:
            return JsonResponse({"error": "Invalid data type."}, status=400)
        
        # Retrieve the available date range from the database.
        try:
            min_date, max_date = get_min_max_dates()
        except ValueError as ve:
            return JsonResponse({"error": str(ve)}, status=404)
        
        # Optionally, check if the requested date range is within the available data range.
        if start_date < min_date or end_date > max_date:
            return JsonResponse(
                {"error": f"Requested date range is outside of available data range: {min_date} to {max_date}"},
                status=400
            )
        
        report_data = generate_report(start_date, end_date, report_type, data_type, smbs)
        if "error" in report_data:
            return JsonResponse(report_data, status=404)
        
        return JsonResponse(report_data, safe=False)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

"""
Name: get_multiple_smbs_by_id
Description: Retrieves details of multiple smbs by id of the plant
Input:
    - Request Method: POST
    - URL Parameters: plant_id
    - Request Body (JSON format): smb_ids
output: 
    - JSON response containing the generated report or error message.
    - Returns error messages for invalid input, missing data, or server errors.
"""
@csrf_exempt
def get_multiple_smbs_by_id(request, plant_id):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            data = json.loads(request.body)

            # Extract smb_ids from the request data
            smb_ids = data.get('smb_ids', [])
            logger.debug(f"Received smb_ids: {smb_ids}")

            if not smb_ids:
                return JsonResponse({'status': 'error', 'message': 'No SMB IDs provided.'}, status=400)

            # Fetch plant data from the database
            plant_data = power_output_collection.find_one({"PlantID": plant_id})
            logger.debug(f"Fetched plant data for PlantID {plant_id}: {plant_data}")

            if not plant_data:
                return JsonResponse({'status': 'error', 'message': f'Plant with ID {plant_id} not found.'}, status=404)

            # Log the GeneratedData field to see its contents
            logger.debug(f"GeneratedData for PlantID {plant_id}: {plant_data.get('GeneratedData', [])}")

            # Initialize a set to store unique string IDs
            all_string_ids = set()

            # Loop through the provided smb_ids and fetch the relevant SMB data
            for smb_id in smb_ids:
                # Extract SMB data for the given smb_id
                smb_data = next((smb for smb in plant_data.get("GeneratedData", []) if smb.get("smb_id") == smb_id), None)
                logger.debug(f"Found SMB data for smb_id {smb_id}: {smb_data}")

                if smb_data:
                    # Add string IDs to the set
                    all_string_ids.update(string.get("string_id", "") for string in smb_data.get("strings", []))

            # Return the response with all unique string IDs
            return JsonResponse({"status": "success", "data": list(sorted(all_string_ids))}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format.'}, status=400)
        except Exception as e:
            logger.exception("An unexpected error occurred.")
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)
