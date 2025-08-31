# MarketHub Backend API

A comprehensive backend API for the MarketHub platform, built with Node.js, Express, and MongoDB using Mongoose.

## Features

- **Product Management**: Full CRUD operations for products with category-specific fields
- **User Authentication**: JWT-based authentication with role-based access control
- **Category Management**: Hierarchical category system with filters
- **Search & Filtering**: Advanced search with pagination and category-specific filters
- **File Upload Support**: Image handling for products
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Password hashing, JWT tokens, and role-based authorization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs
- **CORS**: Cross-origin resource sharing support

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd markethub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `env.example` to `.env`
   - Update the environment variables:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/markethub
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     ```

4. **Database Setup**
   - Ensure MongoDB is running locally, or
   - Update `MONGODB_URI` to point to your MongoDB Atlas cluster

5. **Seed the Database** (Optional)
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 5000).

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Products
- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (seller/admin only)
- `PUT /api/products/:id` - Update product (owner/admin only)
- `DELETE /api/products/:id` - Delete product (owner/admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/main` - Get main categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/:category/filters` - Get category-specific filters

### User Management
- `GET /api/users/products` - Get user's products (protected)
- `GET /api/users/favorites` - Get user's favorites (protected)
- `POST /api/users/favorites/:productId` - Toggle favorite (protected)

## Data Models

### Product Schema
```javascript
{
  title: String,           // Required
  price: String,           // Optional
  location: String,        // Optional
  rating: Number,          // 0-5, default 0
  image: String,           // Required, URL
  category: String,        // Required: marketplace, secondhand, jobs, travel
  featured: Boolean,       // Default false
  description: String,     // Optional
  condition: String,       // Required for secondhand: new, like-new, good, fair, poor
  jobType: String,         // Required for jobs: full-time, part-time, contract, remote, internship
  experience: String,      // Required for jobs: entry, mid, senior, executive
  salary: String,          // Required for jobs
  tripType: String,        // Required for travel: flights, hotels, packages, activities, transport
  duration: String,        // Required for travel
  tags: [String],          // Array of tags
  views: Number,           // Default 0
  favorites: Number,       // Default 0
  seller: ObjectId,        // Required, reference to User
  status: String           // Default 'active'
}
```

### User Schema
```javascript
{
  username: String,        // Required, unique
  email: String,           // Required, unique
  password: String,        // Required, hashed
  firstName: String,       // Required
  lastName: String,        // Required
  avatar: String,          // Optional
  phone: String,           // Optional
  location: String,        // Optional
  bio: String,             // Optional
  role: String,            // Default 'user': user, seller, admin
  isVerified: Boolean,     // Default false
  favorites: [ObjectId],   // Array of Product references
  products: [ObjectId],    // Array of Product references
  rating: Number,          // Default 0
  totalReviews: Number     // Default 0
}
```

### Category Schema
```javascript
{
  name: String,            // Required
  slug: String,            // Required, unique
  description: String,     // Optional
  icon: String,            // Optional
  gradient: String,        // Optional
  parentCategory: ObjectId, // Optional, reference to Category
  subcategories: [ObjectId], // Array of Category references
  productCount: Number,    // Default 0
  isActive: Boolean,       // Default true
  sortOrder: Number,       // Default 0
  filters: Object          // Category-specific filter options
}
```

## Authentication & Authorization

### JWT Token
- Include in request headers: `Authorization: Bearer <token>`
- Tokens expire after 30 days

### Role-Based Access Control
- **User**: Can view products, manage profile, add/remove favorites
- **Seller**: Can create, update, and delete their own products
- **Admin**: Full access to all resources and user management

## Filtering & Search

### Product Filters
- **Category**: marketplace, secondhand, jobs, travel
- **Price Range**: min/max price filtering
- **Location**: Location-based search
- **Condition**: Product condition (for secondhand)
- **Job Type**: Employment type (for jobs)
- **Experience**: Experience level (for jobs)
- **Trip Type**: Travel type (for travel)

### Search
- Full-text search across title, description, and tags
- Case-insensitive search
- Support for multiple search terms

### Pagination
- Page-based pagination with configurable limits
- Default: 12 items per page
- Maximum: 100 items per page

## Database Seeding

The application includes a comprehensive seeder that creates:
- 4 main categories (Marketplace, Secondhand, Jobs, Travel)
- 3 sample users (admin, seller, regular user)
- 10 sample products across all categories

To run the seeder:
```bash
npm run seed
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/markethub |
| `JWT_SECRET` | JWT signing secret | (required) |

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with sample data

### File Structure
```
markethub-backend/
├── controllers/          # Request handlers
├── middleware/          # Custom middleware
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── seeders/            # Database seeding scripts
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12
  }
}
```

## Testing

The API can be tested using:
- Postman
- Insomnia
- curl commands
- Any HTTP client

## Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure MongoDB Atlas for production
4. Set up proper CORS origins
5. Use environment-specific configuration
6. Implement rate limiting
7. Set up monitoring and logging

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
