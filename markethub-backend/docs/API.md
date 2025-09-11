# MarketHub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /users/register
```
**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

#### Login User
```http
POST /users/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Products

#### Get All Products
```http
GET /products?page=1&limit=10&category=marketplace
```

#### Get Product by ID
```http
GET /products/:id
```

#### Create Product (Protected)
```http
POST /products
```
**Body:**
```json
{
  "title": "string",
  "price": "number",
  "category": "marketplace|secondhand|jobs|travel",
  "description": "string",
  "image": "string"
}
```

### Cart (Protected)

#### Get Cart
```http
GET /users/cart
```

#### Add to Cart
```http
POST /users/cart
```
**Body:**
```json
{
  "productId": "string",
  "quantity": "number"
}
```

### Orders (Protected)

#### Create Order
```http
POST /orders
```

#### Get User Orders
```http
GET /orders/user
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error