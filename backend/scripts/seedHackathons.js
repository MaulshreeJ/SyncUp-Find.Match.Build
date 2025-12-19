import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hackathon from '../models/Hackathon.js';

dotenv.config();

const sampleHackathons = [
  {
    name: 'AI Innovation Challenge 2024',
    date: new Date('2024-12-15'),
    endDate: new Date('2024-12-17'),
    location: 'San Francisco, CA',
    type: 'In-Person',
    theme: 'Artificial Intelligence',
    participantsLimit: 100,
    prize: '$50,000',
    difficulty: 'Advanced',
    description: 'Build the next generation of AI applications',
    organizer: 'TechCorp',
    tags: ['AI', 'Machine Learning', 'Innovation']
  },
  {
    name: 'Green Tech Hackathon',
    date: new Date('2024-12-22'),
    endDate: new Date('2024-12-24'),
    location: 'Online',
    type: 'Virtual',
    theme: 'Sustainability',
    participantsLimit: 80,
    prize: '$25,000',
    difficulty: 'Intermediate',
    description: 'Create sustainable technology solutions',
    organizer: 'EcoTech Foundation',
    tags: ['Sustainability', 'Environment', 'Clean Tech']
  },
  {
    name: 'FinTech Revolution',
    date: new Date('2025-01-05'),
    endDate: new Date('2025-01-07'),
    location: 'New York, NY',
    type: 'Hybrid',
    theme: 'Financial Technology',
    participantsLimit: 150,
    prize: '$75,000',
    difficulty: 'Advanced',
    description: 'Revolutionize the financial industry',
    organizer: 'FinanceHub',
    tags: ['FinTech', 'Blockchain', 'Banking']
  }
];

const seedHackathons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing hackathons
    await Hackathon.deleteMany({});
    console.log('Cleared existing hackathons');

    // Insert sample hackathons
    const created = await Hackathon.insertMany(sampleHackathons);
    console.log(`Created ${created.length} hackathons:`, created.map(h => ({ id: h._id, name: h.name })));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hackathons:', error);
    process.exit(1);
  }
};

seedHackathons();