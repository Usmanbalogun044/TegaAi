from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from .models import UserProfile


def index(request):
    """
    Landing page view - shows role selection
    """
    return render(request, 'index.html')


def signup_view(request):
    """
    User signup/registration view
    """
    # If user is already logged in, redirect to dashboard
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        
        # Validate required fields
        errors = []
        
        if not name:
            errors.append('Name is required.')
        elif len(name) < 2:
            errors.append('Name must be at least 2 characters long.')
        
        if not password:
            errors.append('Password is required.')
        elif len(password) < 6:
            errors.append('Password must be at least 6 characters long.')
        
        # Validate email format if provided
        if email:
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                errors.append('Please enter a valid email address.')
        
        # If there are validation errors, show them
        if errors:
            for error in errors:
                messages.error(request, error)
            return render(request, 'signup.html', {
                'name': name,
                'email': email
            })
        
        # Create username from email or name
        if email:
            username = email
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                messages.error(request, 'An account with this email already exists. Please sign in.')
                return render(request, 'signup.html', {
                    'name': name,
                    'email': email
                })
        else:
            # Generate unique username from name
            base_username = name.lower().replace(' ', '_')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
        
        # Create new user
        try:
            user = User.objects.create_user(
                username=username,
                email=email if email else '',
                password=password,
                first_name=name
            )
            
            # Create UserProfile with unique ID
            UserProfile.objects.create(user=user)
            
            # Log the user in
            login(request, user)
            
            messages.success(request, f'Welcome to Tega, {name}! 🎉')
            
            # Redirect to path questionnaire
            return redirect('path_questionnaire')
            
        except Exception as e:
            messages.error(request, f'An error occurred while creating your account. Please try again.')
            return render(request, 'signup.html', {
                'name': name,
                'email': email
            })
    
    # GET request - show signup form
    return render(request, 'signup.html')


def login_view(request):
    """
    User login view
    """
    # If user is already logged in, redirect to dashboard
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        remember = request.POST.get('remember')
        
        # Validate required fields
        if not email or not password:
            messages.error(request, 'Email and password are required.')
            return render(request, 'login.html', {'email': email})
        
        # Try to authenticate with email as username
        user = authenticate(request, username=email, password=password)
        
        # If that fails, try to find user by email and authenticate with username
        if user is None and '@' in email:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            # Check if user is active
            if not user.is_active:
                messages.error(request, 'This account has been disabled.')
                return render(request, 'login.html', {'email': email})
            
            # Log the user in
            login(request, user)
            
            # Set session expiry based on remember me
            if remember:
                # Session expires in 2 weeks
                request.session.set_expiry(1209600)
            else:
                # Session expires on browser close
                request.session.set_expiry(0)
            
            messages.success(request, f'Welcome back, {user.first_name or user.username}! 👋')
            
            # Redirect to next page or dashboard
            next_page = request.GET.get('next', 'dashboard')
            return redirect(next_page)
        else:
            messages.error(request, 'Invalid email or password. Please try again.')
            return render(request, 'login.html', {'email': email})
    
    # GET request - show login form
    return render(request, 'login.html')


def logout_view(request):
    """
    User logout view
    """
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('index')


@login_required
def profile_setup(request):
    """
    Profile setup view for new users
    """
    if request.method == 'POST':
        # Handle profile setup data
        name = request.POST.get('profile-name')
        age = request.POST.get('profile-age')
        voice_guidance = request.POST.get('voice-guidance') == 'on'
        reading_support = request.POST.get('reading-support') == 'on'
        reduced_motion = request.POST.get('reduced-motion') == 'on'
        break_reminders = request.POST.get('break-reminders') == 'on'
        
        # Update user profile (you might want to create a Profile model for this)
        if name:
            request.user.first_name = name
            request.user.save()
        
        # Store preferences in session for now
        # (In a real app, you'd want to create a UserProfile model)
        request.session['preferences'] = {
            'age': age,
            'voice_guidance': voice_guidance,
            'reading_support': reading_support,
            'reduced_motion': reduced_motion,
            'break_reminders': break_reminders,
        }
        
        return redirect('path_questionnaire')
    
    return render(request, 'profile-setup.html')


@login_required
def path_questionnaire(request):
    """Learning path questionnaire page"""
    if request.method == 'POST':
        # Get form data
        learning_style = request.POST.get('learningStyle', '')
        focus_time = request.POST.get('focusTime', '')
        reading_level = request.POST.get('readingLevel', '')
        learning_goal = request.POST.get('learningGoal', '')
        persona = request.POST.get('persona', '')
        
        # Map values to friendly labels
        style_labels = {
            'visual-active': 'Pictures, Games & Videos',
            'audio-patient': 'Listening & Repeating',
            'slow-steady': 'Step-by-Step & Slow',
            'mixed': 'A Mix of Everything'
        }
        
        focus_labels = {
            '5': '5-10 minutes',
            '15': '10-20 minutes',
            '30': '20-30 minutes',
            'flex': 'It Depends'
        }
        
        reading_labels = {
            'struggle': 'I Find It Very Hard',
            'slow': 'I Can Read But It Takes Time',
            'ok': "I'm Okay with Reading",
            'confident': 'I Love Reading!'
        }
        
        goal_labels = {
            'school': 'Help with School Subjects',
            'life-skills': 'Real Life Skills',
            'catch-up': 'Catch Up at My Own Speed',
            'confidence': 'Build Confidence'
        }
        
        # Create quiz results
        quiz_results = [
            {
                'question': 'How do you learn best?',
                'answer': style_labels.get(learning_style, learning_style)
            },
            {
                'question': 'How long can you usually focus on one thing?',
                'answer': focus_labels.get(focus_time, focus_time)
            },
            {
                'question': 'How do you feel about reading?',
                'answer': reading_labels.get(reading_level, reading_level)
            },
            {
                'question': 'What do you want to learn most?',
                'answer': goal_labels.get(learning_goal, learning_goal)
            }
        ]
        
        # Save to session
        request.session['quiz_results'] = quiz_results
        request.session['persona'] = persona
        
        # Redirect based on persona to appropriate dashboard
        persona_dashboards = {
            'chidi': 'dashboard',
            'ngozi': 'dashboard_adult',
            'tunde': 'dashboard'
        }
        
        dashboard_route = persona_dashboards.get(persona, 'dashboard')
        return redirect(dashboard_route)
    
    return render(request, 'path.html')


@login_required
def results_view(request):
    """
    Learning path results view
    """
    # Get quiz results from session
    quiz_results = request.session.get('quiz_results', [])
    
    # Determine learning path based on responses
    # This is simplified - you'd want more complex logic
    learning_path = {
        'name': 'Calm Learning Path',
        'icon': '🌙',
        'description': 'You learn best when lessons are calm, clear, and balanced.',
        'details': "We'll blend visuals, sound, and breaks to keep you relaxed and motivated.",
    }
    
    context = {
        'learning_path': learning_path,
        'quiz_results': quiz_results,
    }
    
    return render(request, 'results.html', context)


@login_required
def dashboard(request):
    """
    Main dashboard view
    """
    user = request.user
    
    # Get user preferences
    preferences = request.session.get('preferences', {})
    
    # Calculate streak and points (mock data for now)
    streak_days = 0
    total_points = 0
    
    context = {
        'user': user,
        'streak_days': streak_days,
        'total_points': total_points,
        'preferences': preferences,
    }
    
    return render(request, 'dashboard.html', context)


@login_required
def dashboard_parent(request):
    """
    Parent dashboard view
    """
    return render(request, 'dashboard-parent.html')


@login_required
def dashboard_adult(request):
    """
    Adult learner dashboard view
    """
    return render(request, 'dashboard-adult.html')


@login_required
def chat_view(request):
    """
    Chat with Tega view
    """
    user = request.user
    streak_days = 0  # You can calculate actual streak here
    
    # Get or create UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    context = {
        'user': user,
        'streak_days': streak_days,
        'unique_id': profile.unique_id,
    }
    
    return render(request, 'chat.html', context)


@login_required
def settings_view(request):
    """
    User settings page
    """
    user = request.user
    
    # Get or create UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    # Get preferences from session or defaults
    preferences = request.session.get('preferences', {})
    
    context = {
        'user': user,
        'age': preferences.get('age', ''),
        'voice_guidance': preferences.get('voice_guidance', False),
        'break_reminders': preferences.get('break_reminders', False),
        'reduce_motion': preferences.get('reduced_motion', False),
        'daily_reminders': preferences.get('daily_reminders', True),
        'achievement_alerts': preferences.get('achievement_alerts', True),
        'high_contrast': preferences.get('high_contrast', False),
        'color_theme': preferences.get('color_theme', 'default'),
        'streak_days': 0,  # Calculate actual streak
        'lessons_completed': 0,  # Get from DB
        'badges_earned': 0,  # Get from DB
        'total_points': 12,  # Get from DB
    }
    
    return render(request, 'settings.html', context)


@login_required
@require_POST
def save_settings(request):
    """
    Save user settings to session
    """
    try:
        data = json.loads(request.body)
        
        # Update preferences in session
        preferences = request.session.get('preferences', {})
        preferences.update({
            'voice_guidance': data.get('voice_guidance', False),
            'break_reminders': data.get('break_reminders', False),
            'reduced_motion': data.get('reduce_motion', False),
            'daily_reminders': data.get('daily_reminders', True),
            'achievement_alerts': data.get('achievement_alerts', True),
            'high_contrast': data.get('high_contrast', False),
            'color_theme': data.get('color_theme', 'default'),
        })
        request.session['preferences'] = preferences
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_POST
def update_profile(request):
    """
    Update user profile fields
    """
    try:
        data = json.loads(request.body)
        field = data.get('field')
        value = data.get('value', '').strip()
        
        user = request.user
        
        if field == 'name':
            user.first_name = value
            user.save()
        elif field == 'email':
            user.email = value
            user.save()
        elif field == 'age':
            preferences = request.session.get('preferences', {})
            preferences['age'] = value
            request.session['preferences'] = preferences
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_POST
def reset_data(request):
    """
    Reset all user data (progress, preferences, etc.)
    """
    try:
        # Clear session data
        request.session.flush()
        
        # In a real app, you'd delete progress records, badges, etc.
        # For now, just clear session
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_POST
def send_message(request):
    """
    API endpoint for sending messages to Tega
    """
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        
        if not message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Here you would integrate with your AI/chatbot service
        # For now, returning a mock response
        response_message = f"Thanks for your message: {message}. I'm learning to respond better!"
        
        return JsonResponse({
            'success': True,
            'response': response_message,
            'timestamp': 'now'
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def adventure_math(request):
    """
    Math Adventures lesson page
    """
    return render(request, 'adventure-math.html')


@login_required
def adventure_reading(request):
    """
    Reading Quest lesson page
    """
    return render(request, 'adventure-reading.html')


@login_required
def adventure_science(request):
    """
    Science Lab lesson page
    """
    return render(request, 'adventure-science.html')


@login_required
def adventure_creative(request):
    """
    Creative Studio lesson page
    """
    return render(request, 'adventure-creative.html')
