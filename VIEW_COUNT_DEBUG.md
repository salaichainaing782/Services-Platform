# View Count Debugging Guide

## Issues Fixed:
1. **Backend Route Mismatch**: Changed `/views` to `/view` in productRoutes.js to match frontend API call
2. **Frontend Error Handling**: Added proper logging and fallback behavior
3. **useEffect Dependencies**: Fixed to run only once on component mount
4. **API Logging**: Added detailed console logs to track the flow

## Testing Steps:

### 1. Backend Test (Database Level)
```bash
cd markethub-backend
node test-views.js
```

### 2. API Endpoint Test
Start the backend server and test the endpoint directly:
```bash
# Get a product ID first
GET http://localhost:5000/api/products

# Test view increment with a real product ID
GET http://localhost:5000/test-views/PRODUCT_ID_HERE
```

### 3. Frontend Test
1. Open the mobile app
2. Navigate to marketplace
3. Tap on any product card
4. Check console logs for view increment messages
5. Go back and tap the same product again
6. Verify the view count increases

## Debug Console Messages:
- **Frontend**: Look for "Incrementing views for product:", "View increment result:", "API: Incrementing views"
- **Backend**: Look for "Incrementing views for product ID:", "Current views before increment:", "Views after increment:"

## Common Issues:
1. **Backend not running**: Make sure `npm run dev` is running in markethub-backend
2. **Database not connected**: Check MongoDB connection in backend logs
3. **Network issues**: Verify API_BASE_URL in api.ts matches your backend server
4. **Product ID format**: Ensure product has valid MongoDB ObjectId

## Current API Configuration:
- Backend: `http://192.168.16.31:5000/api`
- Route: `POST /products/:id/view`
- Response: `{ message, views, productId, title }`