# solar/urls.py
from django.urls import path
from . import views 
urlpatterns = [
    path('add_user/', views.add_user, name='add_user'),
    path('login/', views.login, name='login'),
    path('admin-register/', views.admin_registration, name='admin-register'),
    path('send_otp/',views.send_otp, name='send_otp'),
    path('verify_otp/',views.verify_otp,name='verify_otp'),
    path('resend_otp/',views.resend_otp,name='resend_otp'),
    path('solar-plants/', views.get_all_plants, name="get-solar-plants"),
    path('reset_password/',views.reset_password,name='reset_password'),
    path('update_user_details/',views.update_user_details,name='update_user_details'),
    path('get-user_details-by-id/<str:user_id>/',views.get_user_details_by_id,name='get_user_details_by_id'),
    path('get_all_users/<str:plant_id>/', views.get_all_users, name='get_all_users'),   
    path('delete_user/<str:plant_id>/<str:user_id>/',views.delete_user,name='delete_user'),
    path('plant-register/',views.solar_plant_registration, name="solar-plant-registration"),
    path('energy/', views.generate_energy_data,name ="generate-energy-data"),
    path('upcoming-maintenance/<str:plant_id>/', views.upcoming_maintenance, name='upcoming_maintenance'),
    path('update_maintenance_task/<str:plant_id>/<str:task_id>/',views.update_maintenace_task, name='update_maintenace_task'),
    path('maintenance_task_complete/<str:plant_id>/<str:task_id>/',views.maintenance_task_complete,name='maintenance_task_complete'),
    path('get_maintenace_history/<str:plant_id>/',views.maintenance_history,name='maintenance_history'),
    path('active_alerts/<str:plant_id>/',views.active_alerts, name="get-active-alerts"), # Endpoint to get active alerts
    path('alert_history/<str:plant_id>/',views.alert_history, name="get-alert-history"),
    path('energy-graph/<str:frequency>/<str:smb_id>/',views.energy_data, name="get_energy_graph_data"), # Endpoint to get alert history
    path('solar_plant_data/',views.solar_plant_data, name="solar-plant-data"), # Endpoint to get energy data
    path('users-login-history/<str:plant_id>/',views.get_login_history, name=" get_login_history"), 
    path('delete-solar-plant/',views.delete_plant, name="delete-solar-plant"),
    path('admins/', views.get_all_admins, name="get-all-admins"),
    path('analytics/<str:plant_id>/<str:smb_id>/',views.generate_analytics_data, name="generate_analytics_data"),
    path('update-admin/<str:plant_id>/', views.update_admin, name="update-admin"),    
    path('delete-admin/', views.delete_admin, name="delete-admin"),
    path('get-all-smbs/<str:plant_id>/' ,views.get_all_smbs, name="get-all-smbs"),
    path('layout-register/', views.layout_Register, name='layout_register'),
    path('solar-plants/', views.get_all_plants, name="get-solar-plants"),
    path('get-details/<str:plant_id>/',views.get_details_by_plant_id, name='get_details_by_plant_id'),
    path('power_output/<str:plant_id>/',views.power_output,name='power_output'),
    path('get_details_by_smb_id/<str:plant_id>/<str:smb_id>/',views.get_smb_details_by_id, name='get_smb_details_by_id'), 
    path('get_all_strings/<str:plant_id>/',views.get_all_strings, name='get_all_strings')
]
