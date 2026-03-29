# Vercel Deployment Fix

## Issues Fixed

### 1. **Database Path Issue** ✅
- **Problem**: SQLite database was trying to write to the project root directory which is read-only on Vercel
- **Solution**: Database now writes to `/tmp` on Vercel (the only writable location in serverless), and to local project directory during development
- **File**: `api/db.py` - Added `VERCEL` environment check

### 2. **Template/Static Paths** ✅
- **Problem**: Relative paths `../templates` and `../static` could fail in serverless environment
- **Solution**: Use absolute paths based on `Path(__file__).resolve()`
- **File**: `api/index.py` - Converted to `Path` based resolution

### 3. **SQLite Concurrency** ✅
- **Problem**: SQLite not configured for serverless where multiple processes might access it
- **Solution**: Added `check_same_thread=False` and `timeout=5` to SQLite connection
- **File**: `api/db.py`

### 4. **Error Handling** ✅
- **Problem**: Silent failures made debugging impossible
- **Solution**: Added comprehensive error handlers and logging
- **File**: `api/index.py` - Added `@app.errorhandler()` decorators

### 5. **Health Check Endpoint** ✅
- **Added**: `GET /health` endpoint to verify app and database are working
- **File**: `api/index.py`

## Deployment Checklist

Before pushing to Vercel:

- ✅ Push all changes to GitHub
- ✅ Verify `package.json` or `requirements.txt` has all dependencies
- ✅ Check that `api/index.py` and `vercel.json` are correct

## Test the Fix

1. **Check the health endpoint** after deployment:
   ```
   https://your-domain.vercel.app/health
   ```
   Should return: `{"status": "ok", "message": "Server is running"}`

2. **Try signup**:
   ```
   https://your-domain.vercel.app/signup
   ```

3. **Check Vercel logs** in deployment dashboard for any errors

## Architecture After Fix

```
/api/
  ├── index.py       # Main Flask app (Vercel entry point)
  ├── db.py          # Database connection (SQLite with /tmp support)
  └── __init__.py    # Package marker
/templates/          # HTML templates (deployed with app)
/static/             # Static files (deployed with app)
vercel.json          # Vercel configuration
requirements.txt     # Python dependencies
```

## Local Development

Still works the same way:
```bash
pip install -r requirements.txt
python app.py  # or python api/index.py
```

Database will be saved to `milk_delivery.db` in the project directory.
