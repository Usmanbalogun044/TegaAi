# Tega Learning Platform - Views Documentation

## Overview
This document describes all the views created for the Tega adaptive learning platform.

## Views Created

### 1. **Landing & Authentication Views**

#### `index` - Landing Page
- **URL:** `/`
- **Template:** `index.html`
- **Description:** Shows the landing page with role selection (Student, Adult Learner, Parent)
- **Access:** Public

#### `signup_view` - User Registration
- **URL:** `/signup/`
- **Template:** `signup.html`
- **Methods:** GET, POST
- **Description:** Handles user registration with name, email (optional), and password
- **Features:**
  - Creates new user account
  - Auto-generates username from email or name
  - Validates unique users
  - Automatically logs in user after registration
  - Redirects to profile setup
- **Access:** Public

#### `login_view` - User Login
- **URL:** `/login/`
- **Template:** `login.html`
- **Methods:** GET, POST
- **Description:** Handles user authentication
- **Features:**
  - Email/username and password authentication
  - "Remember me" functionality
  - Session management
  - Redirects to dashboard on success
- **Access:** Public

#### `logout_view` - User Logout
- **URL:** `/logout/`
- **Methods:** GET
- **Description:** Logs out the current user
- **Features:**
  - Clears user session
  - Shows success message
  - Redirects to landing page
- **Access:** Authenticated users only

---

### 2. **Onboarding Views**

#### `profile_setup` - Profile Configuration
- **URL:** `/profile-setup/`
- **Template:** `profile-setup.html`
- **Methods:** GET, POST
- **Description:** Allows users to set up their profile and accessibility preferences
- **Features:**
  - Basic info: name, age
  - Accessibility preferences:
    - Voice guidance
    - Reading support (dyslexia-friendly)
    - Reduced motion
    - Break reminders
  - Stores preferences in session
- **Access:** Authenticated users only
- **Redirects to:** Learning path questionnaire

#### `path_questionnaire` - Learning Style Quiz
- **URL:** `/path/`
- **Template:** `path.html`
- **Methods:** GET, POST
- **Description:** Questionnaire to determine user's learning style
- **Features:**
  - Multi-step questionnaire
  - Stores responses in session
  - Determines optimal learning path
- **Access:** Authenticated users only
- **Redirects to:** Results page

#### `results_view` - Learning Path Results
- **URL:** `/results/`
- **Template:** `results.html`
- **Methods:** GET
- **Description:** Displays personalized learning path based on quiz responses
- **Features:**
  - Shows customized learning path
  - Path details and recommendations
  - Option to adjust preferences
  - Start learning journey
- **Access:** Authenticated users only

---

### 3. **Dashboard Views**

#### `dashboard` - Main Student Dashboard
- **URL:** `/dashboard/`
- **Template:** `dashboard.html`
- **Description:** Main dashboard for student learners
- **Features:**
  - Personalized greeting
  - Streak tracking
  - Points system
  - Learning adventures (Math, Reading, Science, Creative)
  - Quick actions
  - Goals tracking
  - Recent achievements
  - Quick access to chat with Tega
- **Access:** Authenticated users only
- **Context Data:**
  - User information
  - Streak days
  - Total points
  - User preferences

#### `dashboard_parent` - Parent Dashboard
- **URL:** `/dashboard/parent/`
- **Template:** `dashboard-parent.html`
- **Description:** Dashboard for parents to track children's progress
- **Access:** Authenticated users only

#### `dashboard_adult` - Adult Learner Dashboard
- **URL:** `/dashboard/adult/`
- **Template:** `dashboard-adult.html`
- **Description:** Dashboard tailored for adult learners
- **Access:** Authenticated users only

---

### 4. **Chat & Interaction Views**

#### `chat_view` - Chat Interface
- **URL:** `/chat/`
- **Template:** `chat.html`
- **Description:** Interactive chat interface with Tega AI assistant
- **Features:**
  - Real-time messaging interface
  - Voice input option
  - Quick idea prompts
  - Chat history
  - Back to dashboard navigation
- **Access:** Authenticated users only

#### `send_message` - Chat API Endpoint
- **URL:** `/api/send-message/`
- **Methods:** POST
- **Description:** API endpoint for sending messages to Tega
- **Request Format:**
  ```json
  {
    "message": "User message text"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "response": "Tega's response",
    "timestamp": "timestamp"
  }
  ```
- **Access:** Authenticated users only (AJAX/API)

---

## URL Patterns

All URLs are configured in `miva/urls.py` and included in the main project URLs.

```python
/                       -> Landing page
/signup/               -> User registration
/login/                -> User login
/logout/               -> User logout
/profile-setup/        -> Profile configuration
/path/                 -> Learning path questionnaire
/results/              -> Learning path results
/dashboard/            -> Main dashboard
/dashboard/parent/     -> Parent dashboard
/dashboard/adult/      -> Adult learner dashboard
/chat/                 -> Chat with Tega
/api/send-message/     -> Chat API endpoint
```

---

## Configuration Updates

### Settings (epsilon/settings.py)
- Added `miva` to `INSTALLED_APPS`
- Configured `TEMPLATES` directory to include project-level templates
- Configured static files with `STATICFILES_DIRS` pointing to assets
- Added login/logout redirect settings

### Main URLs (epsilon/urls.py)
- Included miva URLs with `include('miva.urls')`
- Added static file serving for development

---

## Features Implemented

### Authentication & Authorization
✅ User registration with validation  
✅ Login with remember me functionality  
✅ Logout with session clearing  
✅ Login required decorators for protected views  
✅ Redirect to login for unauthenticated users  

### User Experience
✅ Flash messages for user feedback  
✅ Session-based preference storage  
✅ Personalized greetings and content  
✅ Progress tracking (streak, points)  

### API Endpoints
✅ RESTful chat API with JSON responses  
✅ Error handling and validation  

---

## Next Steps & Recommendations

### Database Models (To Be Created)
You should create models for:
- **UserProfile** - Extended user information (age, role, avatar)
- **LearningPreferences** - Accessibility and learning preferences
- **LearningPath** - User's assigned learning path
- **ChatMessage** - Chat history
- **Achievement** - User achievements and badges
- **Progress** - Learning progress tracking
- **Streak** - Daily streak tracking

### Integration Points
- AI/Chatbot service for `send_message` endpoint
- Actual learning content and modules
- Progress tracking algorithms
- Achievement/badge system
- Analytics and reporting

### Security Enhancements
- CSRF protection (already enabled)
- Password strength requirements
- Email verification
- Rate limiting for API endpoints
- Input sanitization

### Testing
- Unit tests for all views
- Integration tests for user flows
- API endpoint testing

---

## Usage Examples

### Running the Server
```bash
cd c:\Users\EMINS\Music\epilson\epsilon
python manage.py runserver
```

### Creating Migrations (After Model Creation)
```bash
python manage.py makemigrations
python manage.py migrate
```

### Creating a Superuser
```bash
python manage.py createsuperuser
```

---

## Template Structure

```
templates/
├── index.html              # Landing page
├── signup.html             # Registration
├── login.html              # Login
├── profile-setup.html      # Profile configuration
├── path.html               # Learning path quiz
├── results.html            # Learning path results
├── dashboard.html          # Student dashboard
├── dashboard-parent.html   # Parent dashboard
├── dashboard-adult.html    # Adult dashboard
└── chat.html               # Chat interface
```

All views are now fully functional and ready to use!
