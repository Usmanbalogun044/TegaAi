# 🔗 Complete URL Configuration Reference

## All URLs Properly Configured with Django URL Tags

### ✅ URL Mapping Summary

| Page | URL Path | URL Name | Template |
|------|----------|----------|----------|
| Homepage | `/` | `index` | `index.html` |
| Signup | `/signup/` | `signup` | `signup.html` |
| Login | `/login/` | `login` | `login.html` |
| Logout | `/logout/` | `logout` | N/A (redirects) |
| Profile Setup | `/profile-setup/` | `profile_setup` | `profile-setup.html` |
| Learning Path Quiz | `/path/` | `path_questionnaire` | `path1.html` |
| Results | `/results/` | `results` | `results.html` |
| Dashboard (Student) | `/dashboard/` | `dashboard` | `dashboard.html` |
| Dashboard (Adult) | `/dashboard/adult/` | `dashboard_adult` | `dashboard-adult.html` |
| Dashboard (Parent) | `/dashboard/parent/` | `dashboard_parent` | `dashboard-parent.html` |
| Chat | `/chat/` | `chat` | `chat.html` |
| API: Send Message | `/api/send-message/` | `send_message` | N/A (API endpoint) |

---

## Template URL Updates

### 1. **index.html** (Homepage)
✅ Role cards → `{% url 'signup' %}`  
✅ Login link → `{% url 'login' %}`

### 2. **signup.html** (Registration)
✅ Form action → POST to same page  
✅ Login link → `{% url 'login' %}`  
✅ CSRF token included

### 3. **login.html** (Login)
✅ Form action → POST to same page  
✅ Signup link → `{% url 'signup' %}`  
✅ CSRF token included

### 4. **profile-setup.html** (Profile)
✅ Form action → POST to same page  
✅ Submit → Redirects to `path_questionnaire`  
✅ CSRF token included

### 5. **path1.html** (Questionnaire)
✅ Form action → POST to same page  
✅ Submit → Redirects to `results`  
✅ CSRF token included

### 6. **results.html** (Learning Path Results)
✅ Start Journey → `{% url 'dashboard' %}`  
✅ Adjust Preferences → `{% url 'profile_setup' %}`

### 7. **dashboard.html** (Student Dashboard)
✅ Home nav → `{% url 'dashboard' %}`  
✅ Chat link → `{% url 'chat' %}`  
✅ Logout → `{% url 'logout' %}`

### 8. **dashboard-adult.html** (Adult Dashboard)
✅ Dashboard nav → `{% url 'dashboard_adult' %}`  
✅ Profile link → `{% url 'profile_setup' %}`  
✅ Logout → `{% url 'logout' %}`

### 9. **dashboard-parent.html** (Parent Dashboard)
✅ Dashboard nav → `{% url 'dashboard_parent' %}`  
✅ Logout → `{% url 'logout' %}`

### 10. **chat.html** (Chat Interface)
✅ Home nav → `{% url 'dashboard' %}`  
✅ Back button → `{% url 'dashboard' %}`  
✅ Logout → `{% url 'logout' %}`

---

## Navigation Flows

### New User Flow
```
index (/)
  ↓ [Click role card]
signup (/signup/)
  ↓ [Submit form]
profile-setup (/profile-setup/)
  ↓ [Submit form]
path (/path/)
  ↓ [Complete quiz]
results (/results/)
  ↓ [Start Journey]
dashboard (/dashboard/)
```

### Returning User Flow
```
index (/)
  ↓ [Click "Sign in"]
login (/login/)
  ↓ [Submit credentials]
dashboard (/dashboard/)
```

### Logout Flow
```
dashboard (any)
  ↓ [Click Exit]
logout (/logout/)
  ↓ [Auto redirect]
index (/)
```

---

## Usage in Templates

### Link to a page:
```django
<a href="{% url 'page_name' %}">Link Text</a>
```

### Form action (POST to same page):
```django
<form method="post">
  {% csrf_token %}
  <!-- form fields -->
</form>
```

### Button navigation:
```django
<a href="{% url 'page_name' %}" class="btn">Button Text</a>
```

### JavaScript navigation:
```django
<button onclick="window.location.href='{% url 'page_name' %}'">
```

---

## Common URL Patterns

### Authentication
- Homepage: `{% url 'index' %}`
- Signup: `{% url 'signup' %}`
- Login: `{% url 'login' %}`
- Logout: `{% url 'logout' %}`

### Onboarding
- Profile Setup: `{% url 'profile_setup' %}`
- Questionnaire: `{% url 'path_questionnaire' %}`
- Results: `{% url 'results' %}`

### Dashboards
- Student: `{% url 'dashboard' %}`
- Adult: `{% url 'dashboard_adult' %}`
- Parent: `{% url 'dashboard_parent' %}`

### Features
- Chat: `{% url 'chat' %}`
- API Endpoint: `{% url 'send_message' %}`

---

## Protected Routes

All routes except these require login:
- `/` (index)
- `/signup/`
- `/login/`

Protected routes (require authentication):
- `/profile-setup/`
- `/path/`
- `/results/`
- `/dashboard/`
- `/dashboard/adult/`
- `/dashboard/parent/`
- `/chat/`
- `/api/send-message/`

---

## Redirect Behavior

### After Signup
User is automatically logged in and redirected to:
`/profile-setup/` (Profile Setup)

### After Login
User is redirected to:
- Requested page (if `?next=` parameter exists)
- `/dashboard/` (default)

### After Logout
User is redirected to:
`/` (Homepage)

### Login Required
If user tries to access protected page without login:
- Redirect to: `/login/?next=/requested-page/`
- After login: Redirect back to requested page

---

## URL Parameters

### Login with next parameter:
```
/login/?next=/dashboard/
```
After successful login, user is redirected to `/dashboard/`

---

## API Endpoints

### Send Message (Chat)
- **URL:** `/api/send-message/`
- **Method:** POST
- **Content-Type:** application/json
- **Body:**
  ```json
  {
    "message": "User message text"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "response": "Tega's response",
    "timestamp": "timestamp"
  }
  ```

---

## Testing URLs

### Manual Testing Checklist

#### Navigation Links
- [ ] Homepage role cards → Signup
- [ ] Signup "Sign in" link → Login
- [ ] Login "Create account" link → Signup
- [ ] Dashboard "Chat" link → Chat
- [ ] Dashboard "Exit" → Logout → Homepage
- [ ] Chat "Home" → Dashboard
- [ ] Results "Start Journey" → Dashboard
- [ ] Results "Adjust Preferences" → Profile Setup

#### Forms
- [ ] Signup form submits correctly
- [ ] Login form submits correctly
- [ ] Profile setup form submits correctly
- [ ] Path questionnaire form submits correctly

#### Redirects
- [ ] After signup → Profile Setup
- [ ] After login → Dashboard
- [ ] After logout → Homepage
- [ ] Login required pages → Login page

#### Static Files
- [ ] CSS loads on all pages
- [ ] Images load on all pages
- [ ] JavaScript loads on all pages

---

## Summary

✅ **All URLs configured with Django URL tags**  
✅ **No hardcoded .html links**  
✅ **All forms include CSRF protection**  
✅ **Proper navigation flow between pages**  
✅ **Login/logout redirects working**  
✅ **Protected routes secured**  
✅ **Static files properly referenced**

**All templates are now using Django's URL system correctly!** 🎉
