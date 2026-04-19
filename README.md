# Quick Stay - Full-Stack Airbnb Clone

A production-ready full-stack web application for booking short-term stays, built with the MERN stack (MongoDB, Express, React, Node.js).

![Quick Stay](https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800)

## 🚀 Features

### User Features
- **User Authentication**: JWT-based auth with secure password hashing
- **Property Search**: Advanced filtering by location, price, property type, amenities
- **Interactive Map**: Leaflet map integration for property locations
- **Booking System**: Date selection, availability checking, mock payments
- **Reviews & Ratings**: Leave reviews after booking
- **Wishlist**: Save favorite properties
- **Booking History**: View and manage your bookings

### Host Features
- **Property Management**: Create, edit, delete property listings
- **Image Upload**: Cloudinary integration for property images
- **Dashboard**: View earnings, bookings, and property performance

### Admin Features
- **User Management**: View and manage users
- **Property Oversight**: Approve/unlist properties
- **Analytics**: Booking statistics

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap)
- **Date Handling**: date-fns

## 📁 Project Structure

```
quick-stay/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Auth)
│   │   ├── services/      # API service functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── server.js
│   └── package.json
└── package.json
```

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
# Install all dependencies
npm run install:all
```

2. **Configure environment variables**:

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickstay
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
```

3. **Seed demo data** (requires MongoDB running):
```bash
cd server && node seed.js
```

4. **Start the development servers**:
```bash
# From root - runs both frontend and backend
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

5. **Open browser**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Demo Credentials
```
Email: demo@quickstay.com
Password: demo123

Email: admin@quickstay.com
Password: demo123
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (host/admin)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - User's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/property/:propertyId` - Property reviews

### Wishlist
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist/:userId` - Get wishlist
- `DELETE /api/wishlist/:propertyId` - Remove from wishlist

## 🎯 Key Implementation Details

### JWT Authentication Flow
1. User submits credentials → Server validates
2. Server generates JWT with user ID and role
3. Frontend stores token in localStorage
4. All API requests include token in Authorization header
5. Middleware verifies token on each protected route

### Search & Filter Logic
- MongoDB queries with regex for location search
- Price range filtering with $gte and $lte
- Amenity filtering with $all operator
- Pagination with skip/limit

### Booking Availability
- Check date overlap: `checkIn < newCheckOut AND checkOut > newCheckIn`
- Verify guest count doesn't exceed property maxGuests
- Auto-confirm for demo (real integration would use Stripe)

## 💼 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `client/dist`
4. Add environment variables in Vercel dashboard

### Backend (Render/Railway)
1. Connect repository
2. Set root directory to `server`
3. Add environment variables
4. Configure build command: `npm install`
5. Start command: `node server.js`

## 📝 Interview Tips

### How to Present This Project
- **Problem**: "Built a booking platform for short-term rentals similar to Airbnb"
- **Tech Stack Justification**: "Chose MERN for unified JavaScript, MongoDB for flexible schema, JWT for stateless auth"
- **Challenges Solved**:
  - Date overlap logic for availability checking
  - Image upload with Cloudinary
  - Role-based access control
- **What You'd Add**: "Real-time availability with WebSockets, actual Stripe integration, WebSocket notifications"

### Common Interview Questions
1. **How does authentication work?**
   - Explain JWT flow, token storage, protected routes

2. **How do you handle availability conflicts?**
   - Explain the date overlap query and guest count validation

3. **How would you scale this?**
   - Database indexing, caching with Redis, CDN for images

4. **Security measures?**
   - Password hashing with bcrypt, JWT verification, input validation

## 🔧 Future Enhancements

- Real payment integration (Stripe)
- Real-time availability with WebSockets
- Messaging system between users
- Admin analytics dashboard
- Google Maps integration
- Push notifications
- Multi-language support

## 📄 License

MIT License