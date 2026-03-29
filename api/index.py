import sqlite3
import os
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from .db import get_connection
except ImportError:
    from db import get_connection

# Determine paths for templates and static files bundled with the function.
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = str(BASE_DIR / "templates")
STATIC_DIR = str(BASE_DIR / "static")

print(f"BASE_DIR: {BASE_DIR}")
print(f"TEMPLATE_DIR: {TEMPLATE_DIR}")
print(f"STATIC_DIR: {STATIC_DIR}")
print(f"Template exists: {(BASE_DIR / 'templates').exists()}")

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
app.secret_key = "milk-delivery-local-secret"


def init_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(120) NOT NULL,
                milk VARCHAR(120) NOT NULL,
                quantity REAL NOT NULL,
                price_per_liter REAL NOT NULL,
                total REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
    except Exception as e:
        import traceback
        error_msg = f"DB init error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Unauthorized"}), 401
            return redirect(url_for("login"))
        return fn(*args, **kwargs)

    return wrapper


@app.before_request
def ensure_schema():
    if request.path in {"/favicon.ico", "/health"} or request.path.startswith("/static/"):
        return

    if not getattr(app, "_schema_ready", False):
        try:
            init_db()
            app._schema_ready = True
        except Exception as e:
            print(f"Failed to initialize database: {e}")
            # Continue anyway - error will show in logs


# ---------------- AUTH ----------------
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")

    data = request.get_json(silent=True) or request.form
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if len(username) < 3 or len(password) < 6:
        return jsonify({"success": False, "message": "Username or password too short."}), 400

    hashed_password = generate_password_hash(password)

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed_password),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": "Username already exists."}), 409

    conn.close()
    return jsonify({"success": True, "message": "Account created successfully."})


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    data = request.get_json(silent=True) or request.form
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password FROM users WHERE username=?", (username,))
    user = cur.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        session["user"] = user[1]
        return jsonify({"success": True})

    return jsonify({"success": False, "message": "Invalid username or password."}), 401


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))


# ---------------- PAGES ----------------
@app.route("/")
@login_required
def home():
    return render_template("index.html")


@app.route("/customers")
@login_required
def customers_page():
    return render_template("customers.html")


@app.route("/billing")
@login_required
def billing_page():
    return render_template("billing.html")


@app.route("/reports")
@login_required
def reports_page():
    return render_template("reports.html")


# ---------------- CUSTOMER API ----------------
@app.route("/api/customers", methods=["GET"])
@login_required
def get_customers():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, milk, quantity, price_per_liter, total
        FROM customers
        ORDER BY id DESC
        """
    )
    rows = cur.fetchall()
    conn.close()

    data = [
        {
            "id": row[0],
            "name": row[1],
            "milk": row[2],
            "quantity": float(row[3]),
            "price_per_liter": float(row[4]),
            "total": float(row[5]),
        }
        for row in rows
    ]
    return jsonify(data)


@app.route("/api/customers", methods=["POST"])
@login_required
def add_customer():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    milk = (data.get("milk") or "").strip()
    quantity = float(data.get("quantity") or 0)
    price_per_liter = float(data.get("price_per_liter") or 0)

    if not name or not milk or quantity <= 0 or price_per_liter <= 0:
        return jsonify({"message": "Invalid data"}), 400

    total = quantity * price_per_liter

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO customers (name, milk, quantity, price_per_liter, total)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, milk, quantity, price_per_liter, total),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Customer added"}), 201


@app.route("/api/customers/<int:customer_id>", methods=["PUT"])
@login_required
def update_customer(customer_id):
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    milk = (data.get("milk") or "").strip()
    quantity = float(data.get("quantity") or 0)
    price_per_liter = float(data.get("price_per_liter") or 0)

    if not name or not milk or quantity <= 0 or price_per_liter <= 0:
        return jsonify({"message": "Invalid data"}), 400

    total = quantity * price_per_liter

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE customers
        SET name=?, milk=?, quantity=?, price_per_liter=?, total=?
        WHERE id=?
        """,
        (name, milk, quantity, price_per_liter, total, customer_id),
    )
    updated = cur.rowcount
    conn.commit()
    conn.close()

    if not updated:
        return jsonify({"message": "Customer not found"}), 404

    return jsonify({"message": "Customer updated"})


@app.route("/api/customers/<int:customer_id>", methods=["DELETE"])
@login_required
def delete_customer(customer_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM customers WHERE id=?", (customer_id,))
    deleted = cur.rowcount
    conn.commit()
    conn.close()

    if not deleted:
        return jsonify({"message": "Customer not found"}), 404

    return jsonify({"message": "Customer deleted"})


@app.route("/api/summary")
@login_required
def summary():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM customers")
    customer_count = cur.fetchone()[0]

    cur.execute("SELECT COALESCE(SUM(total), 0) FROM customers")
    revenue = float(cur.fetchone()[0])

    cur.execute("SELECT COALESCE(SUM(quantity), 0) FROM customers")
    liters = float(cur.fetchone()[0])

    conn.close()
    return jsonify(
        {
            "customers": customer_count,
            "revenue": revenue,
            "liters": liters,
        }
    )


# ---------------- INVOICE PAGE ----------------
@app.route("/invoice/<int:customer_id>")
@login_required
def invoice(customer_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, milk, quantity, price_per_liter, total
        FROM customers
        WHERE id=?
        """,
        (customer_id,),
    )
    customer = cur.fetchone()
    conn.close()

    if not customer:
        return "Customer not found", 404

    payload = {
        "id": customer[0],
        "name": customer[1],
        "milk": customer[2],
        "quantity": float(customer[3]),
        "price_per_liter": float(customer[4]),
        "total": float(customer[5]),
    }
    return render_template("invoice.html", customer=payload)


# Error handlers for better debugging
@app.errorhandler(Exception)
def handle_error(e):
    import traceback
    print(f"ERROR: {str(e)}")
    print(traceback.format_exc())
    return {"error": "Internal Server Error", "details": str(e)}, 500


@app.errorhandler(404)
def not_found(e):
    return {"error": "Page not found"}, 404


# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "message": "Server is running"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500


@app.route("/favicon.ico")
def favicon():
    return "", 204


# The Flask app is already exported as 'app' for Vercel WSGI
