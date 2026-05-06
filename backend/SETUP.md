# MealSync Backend - Quick Setup Guide

## Prerequisites
- Python 3.10+
- PostgreSQL 14+
- pip (Python package manager)

## Step-by-Step Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup PostgreSQL Database

**Option A: Using PostgreSQL Command Line**
```bash
psql -U postgres
```

Then in psql:
```sql
CREATE DATABASE mealsync_db;
CREATE USER mealsync_user WITH PASSWORD 'your_secure_password';
ALTER ROLE mealsync_user SET client_encoding TO 'utf8';
ALTER ROLE mealsync_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mealsync_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mealsync_db TO mealsync_user;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Create a new database named `mealsync_db`
3. Create a new login role `mealsync_user` with password
4. Grant all privileges on `mealsync_db` to `mealsync_user`

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
SECRET_KEY=your-long-random-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=mealsync_db
DB_USER=mealsync_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Generate a SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 7. Seed Demo Data
```bash
python manage.py seed_data
```

This will create:
- 1 Admin user (username: `admin`, password: `admin123`)
- 4 Schools with teachers
- 4 Teacher users (username: `teacher_dps001`, password: `teacher123`, etc.)
- 30 students per school
- BMI records for 70% of students

### 8. Run Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/`

### 9. Access Admin Panel
Navigate to: `http://localhost:8000/admin/`

Login with:
- Username: `admin`
- Password: `admin123` (or your superuser credentials)

## API Testing

### Get JWT Token
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Use Token in Requests
```bash
curl -X GET http://localhost:8000/api/schools/schools/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Demo Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Teachers:**
- Username: `teacher_dps001`, `teacher_ghs002`, `teacher_kv003`, `teacher_mps004`
- Password: `teacher123`

## Common Issues

### Issue: "psycopg2.OperationalError: could not connect to server"
**Solution:** Make sure PostgreSQL is running
```bash
# On Linux/Mac
sudo service postgresql start

# On Mac with Homebrew
brew services start postgresql

# On Windows
# Start PostgreSQL service from Services panel
```

### Issue: "No module named 'django'"
**Solution:** Activate virtual environment
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Issue: "FATAL: database does not exist"
**Solution:** Create the database in PostgreSQL (see Step 3)

### Issue: Port 8000 already in use
**Solution:** Kill the process or use a different port
```bash
# Use different port
python manage.py runserver 8001

# Or kill the process on port 8000
# On Linux/Mac
lsof -ti:8000 | xargs kill -9

# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## Next Steps

1. Test API endpoints using Postman or curl
2. Configure CORS for your frontend URL
3. Review and customize models as needed
4. Set up proper authentication in production
5. Configure media file storage (AWS S3, etc.)
6. Set up email notifications
7. Implement ML model for nutrition scoring

## Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up proper database credentials
- [ ] Configure static/media file serving
- [ ] Set up SSL/HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up logging
- [ ] Configure email backend
- [ ] Set up backup strategy
- [ ] Configure monitoring and alerts
