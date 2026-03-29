# Milk Delivery App

A Flask-based web application for managing milk delivery customers, billing, and reporting.

## Features

- **User Authentication**: Signup and login with password hashing
- **Customer Management**: Add, update, delete customers
- **Billing**: Invoice generation and printing
- **Reports**: Dashboard with revenue analytics
- **Database**: PostgreSQL with secure connections

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd milk_delivery_app
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (create `.env` file)
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-change-this
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mydib
   DB_USER=postgres
   DB_PASSWORD=your-password
   ```

5. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE mydib;
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

Visit `http://localhost:5000` and sign up for a new account.

## Deployment to Vercel

### Prerequisites
- Vercel account
- PostgreSQL database (use Vercel Postgres or external service)
- Git repository

### Steps

1. **Create `vercel.json`** in project root
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app.py"
       }
     ]
   }
   ```

2. **Create `.vercelignore`**
   ```
   __pycache__
   *.pyc
   .env
   .git
   venv
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

4. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Add environment variables:
     - `SECRET_KEY`: Your secret key
     - `DATABASE_URL`: Your PostgreSQL connection string
   - Click Deploy

### Environment Variables for Vercel
```
SECRET_KEY=<generate-a-strong-key>
DATABASE_URL=postgresql://user:password@host:port/database
```

## API Endpoints

- `POST /signup` - Create new user
- `POST /login` - Login user
- `GET /logout` - Logout user
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `PUT /api/customers/<id>` - Update customer
- `DELETE /api/customers/<id>` - Delete customer
- `GET /api/summary` - Get summary stats
- `GET /invoice/<id>` - Get customer invoice

## Project Structure

```
milk_delivery_app/
├── app.py                  # Main Flask application
├── db.py                   # Database connection
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel configuration
├── .env                   # Environment variables (not committed)
└── templates/
    ├── index.html         # Dashboard
    ├── login.html         # Login page
    ├── signup.html        # Sign up page
    ├── customers.html     # Customers management
    ├── billing.html       # Billing page
    ├── reports.html       # Reports page
    └── invoice.html       # Invoice template
```

## Technologies Used

- Flask - Web framework
- PostgreSQL - Database
- Bootstrap - UI framework
- Chart.js - Analytics charts
- Werkzeug - Password hashing

## License

MIT
