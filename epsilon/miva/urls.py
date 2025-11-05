from django.urls import path
from . import views

urlpatterns = [
    # Landing and authentication
    path('', views.index, name='index'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Profile and onboarding
    path('profile-setup/', views.profile_setup, name='profile_setup'),
    path('path/', views.path_questionnaire, name='path_questionnaire'),
    path('adult/', views.adult_questionnaire, name='adult_questionnaire'),
    path('student/', views.student_questionnaire, name='student_questionnaire'),
    path('results/', views.results_view, name='results'),
    
    # Dashboards
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/parent/', views.dashboard_parent, name='dashboard_parent'),
    path('dashboard/adult/', views.dashboard_adult, name='dashboard_adult'),
    path('dashboard/chidi/', views.dashboard_chidi, name='dashboard_chidi'),
    path('dashboard/tunde/', views.dashboard_tunde, name='dashboard_tunde'),
    path('dashboard/ngozi/', views.dashboard_ngozi, name='dashboard_ngozi'),
    
    # Chat
    path('chat/', views.chat_view, name='chat'),
    path('api/send-message/', views.send_message, name='send_message'),
    
    # Settings
    path('settings/', views.settings_view, name='settings'),
    path('api/save-settings/', views.save_settings, name='save_settings'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/reset-data/', views.reset_data, name='reset_data'),
    
    # Learning Adventures
    path('adventure/math/', views.adventure_math, name='adventure_math'),
    path('adventure/reading/', views.adventure_reading, name='adventure_reading'),
    path('adventure/science/', views.adventure_science, name='adventure_science'),
    path('adventure/creative/', views.adventure_creative, name='adventure_creative'),
    path('micro-lesson/', views.micro_lesson, name='micro_lesson'),
    path('break-timer/', views.break_timer, name='break_timer'),
]
