require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Property = require('./models/Property');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickstay';

const demoProperties = [
  {
    title: "Modern Downtown Apartment",
    description: "A beautiful modern apartment in the heart of downtown. Features floor-to-ceiling windows, a fully equipped kitchen, and access to building amenities including gym and pool.",
    propertyType: "apartment",
    price: 150,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ["wifi", "parking", "ac", "kitchen", "washer", "tv", "gym", "pool"],
    location: { city: "New York", state: "NY", country: "USA", coordinates: { lat: 40.7128, lng: -74.0060 } },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]
  },
  {
    title: "Cozy Beach House",
    description: "Escape to this charming beach house just steps from the ocean. Perfect for families or couples looking for a relaxing getaway.",
    propertyType: "house",
    price: 250,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ["wifi", "parking", "kitchen", "washer", "tv", "balcony", "pet-friendly"],
    location: { city: "Miami", state: "FL", country: "USA", coordinates: { lat: 25.7617, lng: -80.1918 } },
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"]
  },
  {
    title: "Luxury Villa with Pool",
    description: "Experience the ultimate luxury in this stunning villa. Private pool, outdoor dining area, and breathtaking views.",
    propertyType: "villa",
    price: 400,
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 3,
    amenities: ["wifi", "parking", "pool", "ac", "kitchen", "washer", "dryer", "hot-tub", "balcony"],
    location: { city: "Los Angeles", state: "CA", country: "USA", coordinates: { lat: 34.0522, lng: -118.2437 } },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"]
  },
  {
    title: "Historic Brownstone",
    description: "Step back in time in this beautifully restored brownstone. Original details combined with modern conveniences.",
    propertyType: "apartment",
    price: 200,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["wifi", "heating", "kitchen", "workspace"],
    location: { city: "Boston", state: "MA", country: "USA", coordinates: { lat: 42.3601, lng: -71.0589 } },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]
  },
  {
    title: "Mountain Retreat Cabin",
    description: "A cozy cabin nestled in the mountains. Perfect for a weekend getaway with stunning views and outdoor activities.",
    propertyType: "cottage",
    price: 175,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["wifi", "parking", "heating", "kitchen", "tv"],
    location: { city: "Denver", state: "CO", country: "USA", coordinates: { lat: 39.7392, lng: -104.9903 } },
    images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"]
  },
  {
    title: "Downtown Hotel Suite",
    description: "Elegant suite in a premier downtown hotel. Access to all hotel amenities including room service and concierge.",
    propertyType: "hotel",
    price: 300,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["wifi", "parking", "ac", "breakfast", "gym", "tv"],
    location: { city: "Chicago", state: "IL", country: "USA", coordinates: { lat: 41.8781, lng: -87.6298 } },
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]
  },
  {
    title: "Artistic Studio Loft",
    description: "A unique studio loft with exposed brick and artistic flair. Located in the trendy arts district.",
    propertyType: "studio",
    price: 120,
    maxGuests: 2,
    bedrooms: 0,
    beds: 1,
    bathrooms: 1,
    amenities: ["wifi", "ac", "kitchen", "workspace"],
    location: { city: "Austin", state: "TX", country: "USA", coordinates: { lat: 30.2672, lng: -97.7431 } },
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800"]
  },
  {
    title: "Lakefront Paradise",
    description: "Wake up to stunning lake views in this waterfront property. Kayaks included for guest use.",
    propertyType: "house",
    price: 350,
    maxGuests: 10,
    bedrooms: 5,
    beds: 6,
    bathrooms: 4,
    amenities: ["wifi", "parking", "kitchen", "washer", "dryer", "balcony", "pet-friendly"],
    location: { city: "Seattle", state: "WA", country: "USA", coordinates: { lat: 47.6062, lng: -122.3321 } },
    images: ["https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800"]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@quickstay.com",
      password: hashedPassword,
      role: "host"
    });
    console.log('Created demo user:', demoUser.email);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin",
      email: "admin@quickstay.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log('Created admin user:', adminUser.email);

    // Create properties with demo user as host
    const properties = await Property.create(
      demoProperties.map(p => ({ ...p, host: demoUser._id, rating: Math.random() * 2 + 3, reviewCount: Math.floor(Math.random() * 20) }))
    );
    console.log(`Created ${properties.length} demo properties`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: demo@quickstay.com');
    console.log('   Password: demo123');
    console.log('\n   Email: admin@quickstay.com');
    console.log('   Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();