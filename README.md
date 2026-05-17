# Qayyam — Fine Jewelry E-Commerce Platform

## Quick Start (Local DB + Full CRUD)

```bash


# 1 — Bootstrap & run the backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data && python manage.py runserver

# For subsequent runs (venv already exists):
cd backend && source venv/bin/activate && python manage.py runserver

# 2 — Install frontend dependencies
cd ../frontend && npm install

# 3 — Start the frontend dev server
npm run dev
```

## What Is Included

- Local database: `SQLite` (`backend/db.sqlite3`) with migrations.
- Auth: customer/admin login + signup (JWT).
- Customer workflows:
  - Product listing/detail/search/filter
  - Cart + checkout
  - Payment method selection (mock gateway)
  - Order history + cancellation
  - Profile management
  - Shipment address CRUD
- Admin workflows (`/admin` in frontend app):
  - Product CRUD
  - Category CRUD
  - Order status management
  - Payment status management
  - Customer management (role + active status)

## Demo Credentials

- Admin: `admin / admin1234`
- Customer: `customer / cust1234`
