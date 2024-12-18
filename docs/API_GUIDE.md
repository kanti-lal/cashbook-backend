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
        "name": "John Doe",
        "mobile": "+1234567890",     // optional
        "address": "123 Main St",     // optional
        "dateOfBirth": "1990-01-01"  // optional, ISO format
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
  - `PUT /api/businesses/:businessId` - Update business
    ```json
    {
      "name": "Updated Business Name"
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

### Get All Transactions
- **Endpoint**: GET `/:businessId/transactions`
- **Query Parameters**:
  - `search`: Search term
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
  - `type`: Transaction type (IN/OUT)
  - `category`: Transaction category (CUSTOMER/SUPPLIER)
  - `paymentMode`: Payment mode (CASH/ONLINE)
- **Response**: Array of transactions

### Get Transaction by ID
- **Endpoint**: GET `/:businessId/transactions/:transactionId`
- **Response**: Single transaction object

### Get Customer Transactions
- **Endpoint**: GET `/:businessId/customer-transactions/:customerId`
- **Description**: Retrieves all transactions for a specific customer
- **Response**: Array of transactions with customer details
- **Error Responses**:
  - 404: No transactions found
  - 500: Server error

### Get Supplier Transactions
- **Endpoint**: GET `/:businessId/supplier-transactions/:supplierId`
- **Description**: Retrieves all transactions for a specific supplier
- **Response**: Array of transactions with supplier details
- **Error Responses**:
  - 404: No transactions found
  - 500: Server error

### Create Transaction
- **Endpoint**: POST `/:businessId/transactions`
- **Body Parameters**:
  ```json
  {
    "id": "string",
    "type": "IN|OUT",
    "amount": "number",
    "category": "CUSTOMER|SUPPLIER",
    "paymentMode": "CASH|ONLINE",
    "date": "string",
    "customerId": "string (optional)",
    "supplierId": "string (optional)",
    "description": "string (optional)"
  }
  ```
- **Response**: Created transaction object

### Update Transaction
- **Endpoint**: PUT `/:businessId/transactions/:transactionId`
- **Body Parameters**: Same as Create Transaction (except 'id')
- **Response**: Updated transaction object

### Delete Transaction
- **Endpoint**: DELETE `/:businessId/transactions/:transactionId`
- **Response**: 200 OK

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