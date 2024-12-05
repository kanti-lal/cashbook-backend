# Cashbook API Guide

## Setup Instructions

1. Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_FILE=cashlink.db
JWT_SECRET=your-secret-key-here
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Authentication

All endpoints except `/api/auth/*` require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### Auth Endpoints

- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Response:
  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

- `GET /api/auth/me` - Get current user profile

### Businesses

- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create a new business
  ```json
  {
    "id": "unique-id",
    "name": "Business Name",
    "createdAt": "2023-12-20"
  }
  ```

### Customers

- `GET /api/businesses/:businessId/customers` - Get all customers
- `GET /api/businesses/:businessId/customers?search=query` - Search customers
- `GET /api/businesses/:businessId/customers/:customerId` - Get customer details
- `POST /api/businesses/:businessId/customers` - Create customer
  ```json
  {
    "id": "unique-id",
    "name": "Customer Name",
    "phoneNumber": "1234567890",
    "balance": 0
  }
  ```
- `PUT /api/businesses/:businessId/customers/:customerId` - Update customer
- `DELETE /api/businesses/:businessId/customers/:customerId` - Delete customer

### Suppliers

- `GET /api/businesses/:businessId/suppliers` - Get all suppliers
- `GET /api/businesses/:businessId/suppliers?search=query` - Search suppliers
- `GET /api/businesses/:businessId/suppliers/:supplierId` - Get supplier details
- `POST /api/businesses/:businessId/suppliers` - Create supplier
  ```json
  {
    "id": "unique-id",
    "name": "Supplier Name",
    "phoneNumber": "1234567890",
    "balance": 0
  }
  ```
- `PUT /api/businesses/:businessId/suppliers/:supplierId` - Update supplier
- `DELETE /api/businesses/:businessId/suppliers/:supplierId` - Delete supplier

### Transactions

- `GET /api/businesses/:businessId/transactions` - Get all transactions
- `GET /api/businesses/:businessId/transactions?startDate=2023-01-01&endDate=2023-12-31&paymentMode=CASH` - Filter transactions
- `POST /api/businesses/:businessId/transactions` - Create transaction
  ```json
  {
    "id": "unique-id",
    "type": "IN",  // or "OUT"
    "amount": 100.00,
    "customerId": "customer-id",  // optional
    "supplierId": "supplier-id",  // optional
    "description": "Payment for goods",
    "date": "2023-12-20",
    "category": "CUSTOMER",  // or "SUPPLIER"
    "paymentMode": "CASH"    // or "ONLINE"
  }
  ```
- `DELETE /api/businesses/:businessId/transactions/:transactionId` - Delete transaction

### Analytics

- `GET /api/businesses/:businessId/analytics` - Get monthly analytics
  ```json
  [
    {
      "month": "2023-12",
      "cash": {
        "totalIn": 1000.00,
        "totalOut": 500.00
      },
      "online": {
        "totalIn": 500.00,
        "totalOut": 200.00
      },
      "totalIn": 1500.00,
      "totalOut": 700.00,
      "balance": 800.00
    }
  ]
  ```

## Database Schema

### users
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- email (TEXT UNIQUE)
- password (TEXT)
- name (TEXT)

### businesses
- id (TEXT PRIMARY KEY)
- name (TEXT)
- createdAt (TEXT)
- userId (INTEGER) - Foreign key to users

### customers
- id (TEXT PRIMARY KEY)
- name (TEXT)
- phoneNumber (TEXT)
- balance (REAL)
- businessId (TEXT) - Foreign key to businesses

### suppliers
- id (TEXT PRIMARY KEY)
- name (TEXT)
- phoneNumber (TEXT)
- balance (REAL)
- businessId (TEXT) - Foreign key to businesses

### transactions
- id (TEXT PRIMARY KEY)
- type (TEXT) - "IN" or "OUT"
- amount (REAL)
- customerId (TEXT) - Optional, foreign key to customers
- supplierId (TEXT) - Optional, foreign key to suppliers
- description (TEXT)
- date (TEXT)
- category (TEXT) - "CUSTOMER" or "SUPPLIER"
- paymentMode (TEXT) - "CASH" or "ONLINE"
- businessId (TEXT) - Foreign key to businesses

## Example Usage

1. Register a user:
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});
```

2. Login:
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await response.json();
```

3. Create a business:
```javascript
const response = await fetch('http://localhost:3000/api/businesses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: 'biz-1',
    name: 'My Shop',
    createdAt: new Date().toISOString()
  })
});
```

4. Create a transaction:
```javascript
const response = await fetch('http://localhost:3000/api/businesses/biz-1/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: 'trans-1',
    type: 'IN',
    amount: 100.00,
    customerId: 'cust-1',
    description: 'Payment received',
    date: new Date().toISOString(),
    category: 'CUSTOMER',
    paymentMode: 'CASH'
  })
});
```