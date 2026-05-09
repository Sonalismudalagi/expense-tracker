import pdfplumber
import re
from datetime import datetime
from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # USERS TABLE
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')

    # EXPENSES TABLE WITH USER_ID
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            category TEXT,
            date TEXT,
            description TEXT,
            utr TEXT
        )
    ''')
    

init_db()

@app.route('/')
def home():
    return "API Running"

# ✅ SIGNUP
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, password)
        )
        conn.commit()
        return jsonify({"message": "User created"}), 201
    except:
        return jsonify({"error": "User already exists"}), 400
    finally:
        conn.close()

# ✅ LOGIN
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"user_id": user["id"]})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# ✅ ADD EXPENSE
@app.route('/expense', methods=['POST'])
def add_expense():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO expenses (user_id, amount, category, date, description)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        int(data.get('user_id')),
        data.get('amount'),
        data.get('category'),
        data.get('date'),
        data.get('description')
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Expense added"})

# ✅ PDF UPLOAD
@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    user_id = request.form.get("user_id")

    text = ""

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

    lines = text.split("\n")

    conn = get_db_connection()
    cursor = conn.cursor()

    imported_count = 0
    duplicate_count = 0

    for i in range(len(lines)):

        line = lines[i]

        # FIND DATE
        date_match = re.search(
            r'([A-Za-z]{3}\s\d{2},\s\d{4})',
            line
        )

        if date_match:

            try:
                raw_date = date_match.group(1)

                formatted_date = datetime.strptime(
                    raw_date,
                    "%b %d, %Y"
                ).strftime("%Y-%m-%d")

                description = ""
                amount = 0
                utr = ""

                # SEARCH NEXT FEW LINES
                for j in range(i, min(i + 8, len(lines))):

                    current_line = lines[j]

                    # DESCRIPTION
                    if "Paid to" in current_line:
                        description = current_line.replace(
                            "Paid to", ""
                        ).strip()

                    # AMOUNT
                    amount_match = re.search(
                        r'₹\s?([\d,]+)',
                        current_line
                    )

                    if amount_match:
                        amount = float(
                            amount_match.group(1).replace(",", "")
                        )

                    # UTR / TRANSACTION NUMBER
                    utr_match = re.search(
                        r'(\d{12})',
                        current_line
                    )

                    if utr_match:
                        utr = utr_match.group(1)

                # AUTO CATEGORY DETECTION
                category = "Other"

                desc = description.lower()

                if any(word in desc for word in [
                    "zomato", "swiggy", "restaurant",
                    "cafe", "pizza", "hotel"
                ]):
                    category = "Food"

                elif any(word in desc for word in [
                    "uber", "ola", "rapido",
                    "metro", "bus"
                ]):
                    category = "Travel"

                elif any(word in desc for word in [
                    "medical", "hospital", "pharmacy"
                ]):
                    category = "Health"

                elif any(word in desc for word in [
                    "amazon", "flipkart", "mall",
                    "store"
                ]):
                    category = "Shopping"

                elif any(word in desc for word in [
                    "electricity", "water",
                    "recharge", "bill"
                ]):
                    category = "Bills"

                # INSERT ONLY IF VALID
                if amount > 0 and description:
                    # CHECK DUPLICATES USING UTR
                    if utr:

                        cursor.execute(
                            '''
                            SELECT * FROM expenses
                            WHERE utr=? AND user_id=?
                            ''',
                            (utr, int(user_id))
                        )

                        existing = cursor.fetchone()

                        if existing:
                            duplicate_count += 1
                            continue

                    # INSERT DATA
                    cursor.execute('''
                        INSERT INTO expenses
                        (user_id, amount, category, date, description, utr)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        int(user_id),
                        amount,
                        category,
                        formatted_date,
                        description,
                        utr
                    ))

                    imported_count += 1

            except Exception as e:
                print(e)

    conn.commit()
    conn.close()

    return jsonify({
        "message": f"{imported_count} transactions imported",
        "duplicates_skipped": duplicate_count
    })

# ✅ GET EXPENSES (FILTERED BY USER)
@app.route('/expenses/<int:user_id>', methods=['GET'])
def get_expenses(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        'SELECT * FROM expenses WHERE user_id=?',
        (user_id,)
    )
    expenses = cursor.fetchall()
    conn.close()

    return jsonify([
        dict(e) for e in expenses
    ])

# ✅ DELETE
@app.route('/expense/<int:id>', methods=['DELETE'])
def delete_expense(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})

# ✅ UPDATE
@app.route('/expense/<int:id>', methods=['PUT'])
def update_expense(id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE expenses
        SET amount=?, category=?, date=?, description=?
        WHERE id=?
    ''', (
        data['amount'],
        data['category'],
        data['date'],
        data['description'],
        id
    ))

    conn.commit()
    conn.close()
    return jsonify({"message": "Updated"})

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000)