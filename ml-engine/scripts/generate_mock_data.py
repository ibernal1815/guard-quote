#!/usr/bin/env python3
"""
Mock Data Generator for GuardQuote ML Engine
Generates realistic training data for the 3NF database schema.
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal
import mysql.connector
from mysql.connector import Error

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "database": "guardquote",
}

# Seed data
LOCATIONS = [
    ("90001", "Los Angeles", "CA", "Los Angeles", "West Coast", "high", 1.25),
    ("90210", "Beverly Hills", "CA", "Los Angeles", "West Coast", "low", 1.50),
    ("10001", "New York", "NY", "New York", "Northeast", "high", 1.35),
    ("10019", "Manhattan", "NY", "New York", "Northeast", "critical", 1.45),
    ("60601", "Chicago", "IL", "Cook", "Midwest", "high", 1.20),
    ("33101", "Miami", "FL", "Miami-Dade", "Southeast", "medium", 1.15),
    ("77001", "Houston", "TX", "Harris", "Southwest", "medium", 1.10),
    ("85001", "Phoenix", "AZ", "Maricopa", "Southwest", "low", 1.05),
    ("98101", "Seattle", "WA", "King", "West Coast", "medium", 1.20),
    ("02101", "Boston", "MA", "Suffolk", "Northeast", "medium", 1.25),
    ("30301", "Atlanta", "GA", "Fulton", "Southeast", "medium", 1.15),
    ("80201", "Denver", "CO", "Denver", "Mountain", "low", 1.10),
    ("94102", "San Francisco", "CA", "San Francisco", "West Coast", "high", 1.40),
    ("89101", "Las Vegas", "NV", "Clark", "West Coast", "high", 1.30),
    ("75201", "Dallas", "TX", "Dallas", "Southwest", "medium", 1.15),
]

EVENT_TYPES = [
    ("corporate", "Corporate Event", "Business meetings, conferences, corporate gatherings", 35.00, 0.20, 1),
    ("concert", "Concert/Festival", "Music concerts, festivals, live performances", 45.00, 0.70, 2),
    ("sports", "Sporting Event", "Sports games, tournaments, athletic events", 42.00, 0.60, 2),
    ("private", "Private Event", "Weddings, private parties, celebrations", 30.00, 0.30, 1),
    ("construction", "Construction Site", "Construction site security and monitoring", 32.00, 0.40, 1),
    ("retail", "Retail Security", "Store security, loss prevention", 28.00, 0.35, 1),
    ("residential", "Residential", "Home security, neighborhood patrol", 25.00, 0.25, 1),
]

SERVICE_OPTIONS = [
    ("armed", "Armed Guard", "Licensed armed security personnel", "per_guard", 15.00),
    ("vehicle", "Vehicle Patrol", "Mobile patrol with marked vehicle", "flat", 50.00),
    ("k9", "K9 Unit", "Trained security dog with handler", "hourly", 35.00),
    ("surveillance", "Surveillance Setup", "Temporary camera installation", "flat", 200.00),
    ("executive", "Executive Protection", "Close protection for VIPs", "hourly", 75.00),
    ("crowd_control", "Crowd Control", "Barriers and crowd management equipment", "flat", 150.00),
    ("night_vision", "Night Vision Equipment", "Night vision gear for guards", "per_guard", 25.00),
    ("radio", "Radio Communication", "Two-way radio set", "flat", 30.00),
]

COMPANIES = [
    "Acme Corporation", "TechStart Inc", "Global Events LLC", "Pinnacle Properties",
    "Metro Construction", "Retail Giants", "Sunset Venues", "Harmony Festivals",
    "Elite Gatherings", "SafeSpace Management", "Urban Development Co", "Premier Events",
    "Coastal Properties", "Mountain View Realty", "Downtown Ventures", "Skyline Corp",
    "Horizon Industries", "Pacific Events", "Atlantic Holdings", "Midwest Properties",
]

FIRST_NAMES = ["James", "Maria", "Robert", "Lisa", "Michael", "Sarah", "David", "Jennifer",
               "William", "Emily", "John", "Ashley", "Richard", "Amanda", "Joseph", "Stephanie"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
              "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Jackson"]


def get_connection():
    """Create database connection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise


def seed_locations(cursor):
    """Insert location data."""
    print("Seeding locations...")
    cursor.execute("DELETE FROM locations")

    sql = """INSERT INTO locations
             (zip_code, city, state, county, region, risk_zone, base_multiplier)
             VALUES (%s, %s, %s, %s, %s, %s, %s)"""

    for loc in LOCATIONS:
        cursor.execute(sql, loc)
    print(f"  Inserted {len(LOCATIONS)} locations")


def seed_event_types(cursor):
    """Insert event type data."""
    print("Seeding event types...")
    cursor.execute("DELETE FROM event_types")

    sql = """INSERT INTO event_types
             (code, name, description, base_hourly_rate, risk_weight, min_guards)
             VALUES (%s, %s, %s, %s, %s, %s)"""

    for et in EVENT_TYPES:
        cursor.execute(sql, et)
    print(f"  Inserted {len(EVENT_TYPES)} event types")


def seed_service_options(cursor):
    """Insert service options."""
    print("Seeding service options...")
    cursor.execute("DELETE FROM service_options")

    sql = """INSERT INTO service_options
             (code, name, description, price_type, price)
             VALUES (%s, %s, %s, %s, %s)"""

    for so in SERVICE_OPTIONS:
        cursor.execute(sql, so)
    print(f"  Inserted {len(SERVICE_OPTIONS)} service options")


def seed_users(cursor, count=5):
    """Insert user data."""
    print("Seeding users...")
    cursor.execute("DELETE FROM users")

    sql = """INSERT INTO users
             (email, password_hash, first_name, last_name, role)
             VALUES (%s, %s, %s, %s, %s)"""

    roles = ["admin", "manager", "user", "user", "user"]
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"{first.lower()}.{last.lower()}@guardquote.com"
        cursor.execute(sql, (email, "hashed_password_here", first, last, roles[i]))
    print(f"  Inserted {count} users")


def seed_clients(cursor, count=20):
    """Insert client data."""
    print("Seeding clients...")
    cursor.execute("DELETE FROM clients")

    # Get location IDs
    cursor.execute("SELECT id FROM locations")
    location_ids = [row[0] for row in cursor.fetchall()]

    sql = """INSERT INTO clients
             (company_name, contact_first_name, contact_last_name, email, phone,
              address, location_id, payment_terms)
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""

    used_companies = set()
    for i in range(count):
        company = random.choice([c for c in COMPANIES if c not in used_companies])
        used_companies.add(company)
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"contact@{company.lower().replace(' ', '').replace(',', '')}.com"
        phone = f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"
        address = f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Elm', 'Park', 'First'])} St"

        cursor.execute(sql, (
            company, first, last, email, phone, address,
            random.choice(location_ids), random.choice([15, 30, 45, 60])
        ))
    print(f"  Inserted {count} clients")


def generate_quote_number():
    """Generate unique quote number."""
    return f"GQ-{datetime.now().strftime('%Y%m')}-{random.randint(10000, 99999)}"


def seed_quotes(cursor, count=500):
    """Generate quote data with realistic patterns."""
    print(f"Seeding {count} quotes...")
    cursor.execute("DELETE FROM ml_training_data")
    cursor.execute("DELETE FROM quote_line_items")
    cursor.execute("DELETE FROM quote_status_history")
    cursor.execute("DELETE FROM quotes")

    # Get foreign key IDs
    cursor.execute("SELECT id FROM clients")
    client_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT id, code, base_hourly_rate, risk_weight FROM event_types")
    event_types = cursor.fetchall()

    cursor.execute("SELECT id, zip_code, state, risk_zone, base_multiplier FROM locations")
    locations = cursor.fetchall()

    quote_sql = """INSERT INTO quotes
        (quote_number, client_id, created_by, event_type_id, location_id,
         event_date, event_name, num_guards, hours_per_guard, crowd_size,
         subtotal, tax_rate, tax_amount, total_price, risk_score, risk_level,
         confidence_score, status, valid_until)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

    ml_sql = """INSERT INTO ml_training_data
        (quote_id, event_type_code, zip_code, state, risk_zone, num_guards,
         hours_per_guard, total_guard_hours, crowd_size, day_of_week, hour_of_day,
         month, is_weekend, is_night_shift, is_armed, has_vehicle, final_price,
         risk_score, was_accepted)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

    statuses = ["draft", "sent", "accepted", "rejected", "expired", "completed"]
    status_weights = [0.05, 0.10, 0.50, 0.15, 0.10, 0.10]  # Most are accepted

    for i in range(count):
        # Random event type and location
        et = random.choice(event_types)
        et_id, et_code, base_rate, risk_weight = et

        loc = random.choice(locations)
        loc_id, zip_code, state, risk_zone, loc_multiplier = loc

        # Event date (past 2 years for training data)
        days_ago = random.randint(1, 730)
        event_date = datetime.now() - timedelta(days=days_ago)
        hour = random.choice([8, 9, 10, 14, 15, 18, 19, 20, 21, 22])
        event_date = event_date.replace(hour=hour, minute=0, second=0)

        # Guard requirements based on event type
        if et_code == "concert":
            num_guards = random.randint(4, 20)
            hours = random.uniform(6, 12)
            crowd_size = random.randint(500, 10000)
        elif et_code == "sports":
            num_guards = random.randint(3, 15)
            hours = random.uniform(4, 8)
            crowd_size = random.randint(1000, 50000)
        elif et_code == "corporate":
            num_guards = random.randint(1, 5)
            hours = random.uniform(4, 10)
            crowd_size = random.randint(50, 500)
        elif et_code == "construction":
            num_guards = random.randint(1, 3)
            hours = random.uniform(8, 12)
            crowd_size = 0
        else:
            num_guards = random.randint(1, 4)
            hours = random.uniform(3, 8)
            crowd_size = random.randint(20, 300)

        hours = round(hours, 2)

        # Calculate risk score
        risk_score = float(risk_weight)
        if event_date.weekday() >= 5:  # Weekend
            risk_score += 0.1
        if hour >= 22 or hour < 6:  # Night
            risk_score += 0.15
        if crowd_size > 1000:
            risk_score += min(crowd_size / 20000, 0.3)

        # Location risk adjustment
        zone_risk = {"low": 0, "medium": 0.1, "high": 0.2, "critical": 0.3}
        risk_score += zone_risk.get(risk_zone, 0.1)
        risk_score = min(risk_score, 1.0)

        # Determine risk level
        if risk_score < 0.25:
            risk_level = "low"
        elif risk_score < 0.5:
            risk_level = "medium"
        elif risk_score < 0.75:
            risk_level = "high"
        else:
            risk_level = "critical"

        # Calculate pricing
        risk_multiplier = 1.0 + (risk_score * 0.5)
        hourly_rate = float(base_rate) * float(loc_multiplier) * risk_multiplier
        subtotal = hourly_rate * hours * num_guards

        # Add armed premium randomly
        is_armed = random.random() < 0.3
        if is_armed:
            subtotal += 15.0 * hours * num_guards

        # Add vehicle randomly
        has_vehicle = random.random() < 0.2
        if has_vehicle:
            subtotal += 50.0 * num_guards

        tax_rate = 0.0875  # 8.75%
        tax_amount = subtotal * tax_rate
        total_price = subtotal + tax_amount

        # Status with weighted random
        status = random.choices(statuses, weights=status_weights)[0]
        was_accepted = status in ["accepted", "completed"]

        # Insert quote (use sequential i to guarantee uniqueness)
        quote_number = f"GQ-{(datetime.now() - timedelta(days=days_ago)).strftime('%Y%m')}-{10000 + i}"
        valid_until = event_date + timedelta(days=30)

        cursor.execute(quote_sql, (
            quote_number,
            random.choice(client_ids),
            random.choice(user_ids),
            et_id,
            loc_id,
            event_date,
            f"{et_code.title()} Event",
            num_guards,
            hours,
            crowd_size,
            round(subtotal, 2),
            tax_rate,
            round(tax_amount, 2),
            round(total_price, 2),
            round(risk_score, 3),
            risk_level,
            round(0.85 + random.random() * 0.1, 3),
            status,
            valid_until
        ))

        quote_id = cursor.lastrowid

        # Insert ML training data
        day_of_week = event_date.weekday()
        is_weekend = day_of_week >= 5
        is_night = hour >= 22 or hour < 6

        cursor.execute(ml_sql, (
            quote_id,
            et_code,
            zip_code,
            state,
            risk_zone,
            num_guards,
            hours,
            round(num_guards * hours, 2),
            crowd_size,
            day_of_week,
            hour,
            event_date.month,
            is_weekend,
            is_night,
            is_armed,
            has_vehicle,
            round(total_price, 2),
            round(risk_score, 3),
            was_accepted
        ))

        if (i + 1) % 100 == 0:
            print(f"  Generated {i + 1}/{count} quotes...")

    print(f"  Inserted {count} quotes with ML training data")


def main():
    """Run the mock data generator."""
    print("=" * 50)
    print("GuardQuote Mock Data Generator")
    print("=" * 50)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Seed reference data
        seed_locations(cursor)
        seed_event_types(cursor)
        seed_service_options(cursor)
        seed_users(cursor)
        seed_clients(cursor)

        # Generate quotes and ML data
        seed_quotes(cursor, count=1000)

        conn.commit()
        print("\n" + "=" * 50)
        print("Mock data generation complete!")
        print("=" * 50)

        # Show counts
        tables = ["locations", "event_types", "service_options", "users", "clients", "quotes", "ml_training_data"]
        print("\nTable row counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count}")

    except Error as e:
        print(f"Error: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
