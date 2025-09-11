# Services Platform - MarketHub

A comprehensive marketplace platform supporting multiple categories: marketplace, secondhand, jobs, services, and travel.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Services Platform"
```

2. **Backend Setup**
```bash
cd markethub-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd ../All-in-One-Marketplace
npm install
npm run dev
```

4. **Database Setup**
```bash
# Start MongoDB service
# Then seed the database
cd markethub-backend
npm run seed
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `markethub-backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/markethub
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📁 Project Structure

```
Services Platform/
├── All-in-One-Marketplace/     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── tests/             # Frontend tests
│   └── package.json
├── markethub-backend/          # Node.js Backend
│   ├── controllers/           # Route controllers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration files
│   ├── tests/                # Backend tests
│   └── package.json
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd markethub-backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd All-in-One-Marketplace
npm test
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd All-in-One-Marketplace
npm run build

# Backend
cd markethub-backend
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📚 Features

- **Multi-category Marketplace**: Products, secondhand items, jobs, services, travel
- **User Authentication**: JWT-based auth with role management
- **Shopping Cart**: Add/remove items, checkout process
- **Order Management**: Track orders, seller dashboard
- **Admin Panel**: User and product management
- **Responsive Design**: Mobile-first approach
- **Internationalization**: Multi-language support
- **Security**: CSRF protection, input sanitization, rate limiting

## 🔒 Security Features

- JWT Authentication
- CSRF Protection
- Input Sanitization (XSS & NoSQL Injection)
- Rate Limiting
- Secure Headers (Helmet.js)
- CORS Configuration

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components
- React Router
- React Hook Form
- Zustand/Context API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image Upload)
- Jest (Testing)

## 📖 API Documentation

See [API Documentation](markethub-backend/docs/API.md) for detailed endpoint information.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.