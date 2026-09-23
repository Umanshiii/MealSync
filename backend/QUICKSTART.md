# MealSync Backend - Quick Start (SQLite)

This is the fastest way to get the backend running using SQLite (no database installation needed).

## Prerequisites
- Python 3.8 or higher

## Steps

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**On Linux/Mac:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run Migrations
```bash
python manage.py migrate
```

### 6. Create Demo Data
```bash
python manage.py seed_data
```

### 7. Start Server
```bash
python manage.py runserver
```

**Backend is now running at:** http://localhost:8000/

## Test It

**Admin Panel:** http://localhost:8000/admin/
- Username: `admin`
- Password: `admin123`

**API Root:** http://localhost:8000/api/

**Get JWT Token:**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Demo Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Teachers:**
- Username: `teacher_dps001`, `teacher_ghs002`, `teacher_kv003`, `teacher_mps004`
- Password: `teacher123`

## API Endpoints

- `POST /api/auth/token/` - Login and get JWT token
- `GET /api/users/me/` - Get current user
- `GET /api/schools/schools/` - List schools
- `GET /api/schools/students/` - List students
- `GET /api/meals/records/` - List meal records
- `GET /api/bmi/records/` - List BMI records
- `GET /api/bmi/compliance/` - List compliance status
- `GET /api/bmi/compliance/dashboard_summary/` - Dashboard summary

## Next Steps

1. Start the frontend: `cd .. && pnpm run dev`
2. Open http://localhost:5173/ in your browser
3. Login with demo credentials

## Notes

- SQLite database file is `db.sqlite3` (auto-created)
- For production, switch to PostgreSQL (see SETUP.md)
- Media files stored in `media/` folder
