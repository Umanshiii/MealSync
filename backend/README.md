# MealSync Backend API

Django REST API for the MealSync (Midday Meal Monitoring & Nutrition System) application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE mealsync_db;
CREATE USER mealsync_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mealsync_db TO mealsync_user;
```

### 3. Environment Variables

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other settings.

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/users/login/` - Custom login endpoint
- `GET /api/users/me/` - Get current user profile

### Users
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Schools
- `GET /api/schools/schools/` - List schools
- `POST /api/schools/schools/` - Create school
- `GET /api/schools/schools/{id}/` - Get school details
- `GET /api/schools/schools/{id}/students/` - Get school students

### Students
- `GET /api/schools/students/` - List students
- `POST /api/schools/students/` - Create student
- `GET /api/schools/students/{id}/` - Get student details

### Meal Records
- `GET /api/meals/records/` - List meal records
- `POST /api/meals/records/` - Create meal record
- `GET /api/meals/records/{id}/` - Get meal record details
- `POST /api/meals/records/{id}/recalculate_nutrition/` - Recalculate nutrition score

### Attendance
- `GET /api/meals/attendance/` - List attendance records
- `POST /api/meals/attendance/` - Mark attendance
- `POST /api/meals/attendance/bulk_mark/` - Bulk mark attendance

### BMI Records
- `GET /api/bmi/records/` - List BMI records
- `POST /api/bmi/records/` - Create BMI record
- `GET /api/bmi/records/{id}/` - Get BMI record details
- `GET /api/bmi/records/student_history/?student_id={id}` - Get student BMI history
- `GET /api/bmi/records/school_summary/?school_id={id}&month={m}&year={y}` - Get school BMI summary

### BMI Compliance
- `GET /api/bmi/compliance/` - List compliance status
- `GET /api/bmi/compliance/dashboard_summary/?month={m}&year={y}` - Get dashboard summary
- `GET /api/bmi/compliance/school_detail/?school_id={id}&month={m}&year={y}` - Get detailed school view
- `POST /api/bmi/compliance/refresh_compliance/` - Manually refresh compliance

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

## Features

- **Role-based authentication** (Admin, Teacher)
- **School management** with student records
- **Daily meal tracking** with photo upload
- **Attendance marking** with bulk operations
- **Monthly BMI tracking** with auto-calculation
- **Compliance monitoring** with automated status updates
- **Health alerts** for underweight students and BMI drops
- **Analytics endpoints** for dashboard charts

## Models

### User
Custom user model with roles (admin/teacher) and school assignment.

### School
School information with contact details and location.

### Student
Student records linked to schools with guardian information.

### MealRecord
Daily meal photos with auto-calculated nutrition scores.

### Attendance
Student attendance linked to meal records.

### BMIRecord
Monthly BMI measurements with auto-calculated BMI values and categories.

### BMIComplianceStatus
School-level compliance tracking per month with automatic updates.

## Auto-Calculations

### BMI Calculation
- Formula: `BMI = weight_kg / (height_m)²`
- Categories: Underweight (<18.5), Normal (18.5-25), Overweight (25-30), Obese (≥30)

### Compliance Status
- **Compliant**: 100% students with BMI records
- **Partially Compliant**: 50-99% students with BMI records
- **Non-Compliant**: <50% students with BMI records

## Development

### Create Demo Data

You can create demo data using Django shell:

```bash
python manage.py shell
```

Then run the data seeding script (to be created).

### Run Tests

```bash
python manage.py test
```
