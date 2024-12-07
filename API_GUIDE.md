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