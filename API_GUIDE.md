# API Documentation

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
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
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "mobile": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-01"
  }
  ```

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

### Get Current User Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "mobile": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-01"
  }
  ```

### Update User Profile
- **URL**: `/api/auth/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "John Doe Updated",
    "mobile": "+1234567890",     // optional
    "address": "456 New St",     // optional
    "dateOfBirth": "1990-01-01"  // optional
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe Updated",
    "mobile": "+1234567890",
    "address": "456 New St",
    "dateOfBirth": "1990-01-01"
  }
  ```

### Password Reset Request
- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Password reset email sent"
  }
  ```

### Reset Password
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "reset_token_here",
    "password": "new_password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Password reset successful"
  }
  ```

### Update Password
- **URL**: `/api/auth/update-password`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentPassword": "old_password",
    "newPassword": "new_password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input data
  ```json
  {
    "errors": [
      {
        "msg": "Invalid value",
        "param": "email",
        "location": "body"
      }
    ]
  }
  ```

- **401 Unauthorized**: Missing or invalid authentication token
  ```json
  {
    "message": "Unauthorized"
  }
  ```

- **403 Forbidden**: Valid token but insufficient permissions
  ```json
  {
    "message": "Forbidden"
  }
  ```

- **404 Not Found**: Resource not found
  ```json
  {
    "message": "User not found"
  }
  ```

- **409 Conflict**: Resource already exists
  ```json
  {
    "message": "User already exists"
  }
  ```

- **500 Internal Server Error**: Server error
  ```json
  {
    "message": "Something went wrong!"
  }
  ```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is obtained from the login endpoint and should be included in all subsequent requests to protected endpoints.


## Business Endpoints

### Get All Businesses
- **URL**: `/api/businesses`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`  ```json
  [
    {
      "id": "business_id",
      "name": "Business Name",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]  ```

### Create Business
- **URL**: `/api/businesses`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:  ```json
  {
    "id": "unique_id",
    "name": "Business Name"
  }  ```
- **Success Response**: `201 Created`

## Transaction Endpoints

### Get All Transactions
- **URL**: `/api/businesses/:businessId/transactions`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Search text
  - `startDate`: Filter by start date (YYYY-MM-DD)
  - `endDate`: Filter by end date (YYYY-MM-DD)
  - `type`: Filter by type (IN/OUT)
  - `category`: Filter by category (CUSTOMER/SUPPLIER)
  - `paymentMode`: Filter by payment mode (CASH/ONLINE)
- **Success Response**: `200 OK`  ```json
  [
    {
      "id": "transaction_id",
      "type": "IN",
      "amount": 1000,
      "customerId": "customer_id",
      "supplierId": null,
      "description": "Payment received",
      "date": "2024-01-01",
      "category": "CUSTOMER",
      "paymentMode": "CASH",
      "businessId": "business_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]  ```

### Get Transaction by ID
- **URL**: `/api/businesses/:businessId/transactions/:transactionId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`  ```json
  {
    "id": "transaction_id",
    "type": "IN",
    "amount": 1000,
    "customerId": "customer_id",
    "supplierId": null,
    "description": "Payment received",
    "date": "2024-01-01",
    "category": "CUSTOMER",
    "paymentMode": "CASH",
    "businessId": "business_id",
    "partyName": "Customer Name",
    "partyPhone": "1234567890"
  }  ```

### Create Transaction
- **URL**: `/api/businesses/:businessId/transactions`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:  ```json
  {
    "id": "unique_id",
    "type": "IN",
    "amount": 1000,
    "customerId": "customer_id",
    "description": "Payment received",
    "date": "2024-01-01",
    "category": "CUSTOMER",
    "paymentMode": "CASH"
  }  ```
- **Success Response**: `201 Created`

### Update Transaction
- **URL**: `/api/businesses/:businessId/transactions/:transactionId`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:  ```json
  {
    "type": "IN",
    "amount": 1500,
    "customerId": "customer_id",
    "description": "Updated payment",
    "date": "2024-01-01",
    "category": "CUSTOMER",
    "paymentMode": "ONLINE"
  }  ```
- **Success Response**: `200 OK`

### Delete Transaction
- **URL**: `/api/businesses/:businessId/transactions/:transactionId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

### Get Transaction Analytics
- **URL**: `/api/businesses/:businessId/analytics`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`  ```json
  [
    {
      "month": "2024-01",
      "cash": {
        "totalIn": 5000,
        "totalOut": 3000
      },
      "online": {
        "totalIn": 2000,
        "totalOut": 1000
      },
      "totalIn": 7000,
      "totalOut": 4000,
      "balance": 3000
    }
  ]  ```

## Customer Endpoints

### Get All Customers
- **URL**: `/api/businesses/:businessId/customers`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Search by name or phone number
- **Success Response**: `200 OK`

### Create Customer
- **URL**: `/api/businesses/:businessId/customers`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:  ```json
  {
    "id": "unique_id",
    "name": "Customer Name",
    "phoneNumber": "1234567890",
    "balance": 0
  }  ```
- **Success Response**: `201 Created`

### Update Customer
- **URL**: `/api/businesses/:businessId/customers/:customerId`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

### Delete Customer
- **URL**: `/api/businesses/:businessId/customers/:customerId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

## Supplier Endpoints

### Get All Suppliers
- **URL**: `/api/businesses/:businessId/suppliers`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Search by name or phone number
- **Success Response**: `200 OK`

### Create Supplier
- **URL**: `/api/businesses/:businessId/suppliers`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:  ```json
  {
    "id": "unique_id",
    "name": "Supplier Name",
    "phoneNumber": "1234567890",
    "balance": 0
  }  ```
- **Success Response**: `201 Created`

### Update Supplier
- **URL**: `/api/businesses/:businessId/suppliers/:supplierId`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

### Delete Supplier
- **URL**: `/api/businesses/:businessId/suppliers/:supplierId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

## Error Responses