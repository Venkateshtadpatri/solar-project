from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
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
#mongodb+srv://saigopalbonthu:2BCQe21Y3QDuEuFe@node.8s5hmks.mongodb.net/
# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017")  # Replace with your MongoDB URI
db = client['solarR&Ddatabase']  # Database name
users_collection = db['users']   # Collection for user registration
admin_collection = db['admin']   # Collection for admin registration
login_history_collection = db['users_login_history']
energy_collection = db['solar_plant_data']
smb_collection = db['smbs_data']
string_collection= db['strings_data']
graph_collection = db['graph_collection']
alerts_collection = db['alerts']
collection = db['generated_ids']  # Collection name
solar_plants_collection= db['solar_plants'] # Collection name
power_output_collection = db['power_output'] # Collection name

logger = logging.getLogger(__name__)

# Helper function to validate email format
def is_valid_email(email):
    email_regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.match(email_regex, email)
# =====================================================================================
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
            permits_file_path = os.path.join("C:\\Users\\Sai Gopal\\WebstormProjects\\solar-layout\\solar-layout-generator\\Plant\\myproject\\permitfiles", permits_file.name)  # Create full file path
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
            if len(phone_number) != 10 or not phone_number.isdigit():
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
            user_id = f"{Plant_ID}_01"
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
                    'Number_of_panels': plant.get('Number_of_panels'),
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
                        'voltage': voltage,
                        'power_output': power_output
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

            return JsonResponse({'status': 'success', 'data': smb_data}, status=200)

        except Exception as e:
            logger.exception("An unexpected error occurred.")
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)


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

                smb_summary = {
                    'smb_id': smb_id,
                    'String_count': string_count,
                    'Power_output': round(total_power_output, 2),
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