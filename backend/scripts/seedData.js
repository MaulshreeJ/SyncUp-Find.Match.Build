import dotenv from "dotenv";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";
import Resource from "../models/Resource.js";
import Post from "../models/Post.js";
import Announcement from "../models/Announcement.js";
import connectDB from "../config/db.js";
import mongoose from "mongoose";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    console.log("🌱 Starting data seeding...");

    // Clear existing data (except admin user)
    await Hackathon.deleteMany({});
    await Resource.deleteMany({});
    await Post.deleteMany({});
    await Announcement.deleteMany({});
    
    // Get admin user
    const adminUser = await User.findOne({ email: "admin@syncup.ai" });
    if (!adminUser) {
      console.error("❌ Admin user not found. Please run the server first to create admin user.");
      process.exit(1);
    }

    // Create sample hackathons
    const hackathons = [
      {
        name: "AI Innovation Challenge 2025",
        date: new Date("2025-03-15"),
        endDate: new Date("2025-03-17"),
        location: "San Francisco, CA",
        type: "In-Person",
        theme: "Artificial Intelligence",
        participantsLimit: 500,
        prize: "$50,000",
        difficulty: "Intermediate",
        description: "Build the next generation of AI applications that solve real-world problems. Focus on machine learning, natural language processing, and computer vision.",
        organizer: "TechCorp Inc.",
        tags: ["AI", "Machine Learning", "Innovation", "Startup"]
      },
      {
        name: "GreenTech Hackathon",
        date: new Date("2025-04-20"),
        endDate: new Date("2025-04-22"),
        location: "Virtual",
        type: "Virtual",
        theme: "Sustainability",
        participantsLimit: 300,
        prize: "$25,000",
        difficulty: "Beginner",
        description: "Create sustainable technology solutions for environmental challenges. Build apps and tools that promote green living and environmental awareness.",
        organizer: "EcoTech Foundation",
        tags: ["Sustainability", "Environment", "Green Tech", "Climate"]
      },
      {
        name: "FinTech Revolution",
        date: new Date("2025-05-10"),
        endDate: new Date("2025-05-12"),
        location: "New York, NY",
        type: "Hybrid",
        theme: "Financial Technology",
        participantsLimit: 400,
        prize: "$75,000",
        difficulty: "Advanced",
        description: "Revolutionize the financial industry with cutting-edge technology. Build solutions for payments, lending, investing, and financial inclusion.",
        organizer: "FinTech Alliance",
        tags: ["FinTech", "Blockchain", "Payments", "Banking"]
      },
      {
        name: "HealthTech Innovation",
        date: new Date("2025-06-05"),
        endDate: new Date("2025-06-07"),
        location: "Boston, MA",
        type: "In-Person",
        theme: "Healthcare Technology",
        participantsLimit: 250,
        prize: "$40,000",
        difficulty: "Intermediate",
        description: "Transform healthcare through technology. Focus on telemedicine, health monitoring, medical AI, and patient care solutions.",
        organizer: "MedTech Innovations",
        tags: ["HealthTech", "Medical AI", "Telemedicine", "Healthcare"]
      }
    ];

    console.log("📊 Creating hackathons...");
    const createdHackathons = await Hackathon.insertMany(hackathons);
    console.log(`✅ Created ${createdHackathons.length} hackathons`); 
   // Create sample resources
    const resources = [
      {
        title: "React.js Complete Guide",
        type: "Tutorial",
        url: "https://reactjs.org/tutorial/tutorial.html",
        description: "Learn React.js from basics to advanced concepts with hands-on examples.",
        tags: ["React", "JavaScript", "Frontend", "Web Development"],
        author: adminUser._id,
        difficulty: "Beginner"
      },
      {
        title: "Node.js Best Practices",
        type: "Documentation",
        url: "https://nodejs.org/en/docs/guides/",
        description: "Comprehensive guide to Node.js development best practices and patterns.",
        tags: ["Node.js", "Backend", "JavaScript", "API"],
        author: adminUser._id,
        difficulty: "Intermediate"
      },
      {
        title: "Machine Learning Crash Course",
        type: "Course",
        url: "https://developers.google.com/machine-learning/crash-course",
        description: "Google's fast-paced, practical introduction to machine learning.",
        tags: ["Machine Learning", "AI", "Python", "TensorFlow"],
        author: adminUser._id,
        difficulty: "Beginner"
      },
      {
        title: "Docker for Developers",
        type: "Tutorial",
        url: "https://docs.docker.com/get-started/",
        description: "Learn containerization with Docker for modern application deployment.",
        tags: ["Docker", "DevOps", "Containerization", "Deployment"],
        author: adminUser._id,
        difficulty: "Intermediate"
      }
    ];

    console.log("📚 Creating resources...");
    const createdResources = await Resource.insertMany(resources);
    console.log(`✅ Created ${createdResources.length} resources`);

    // Create sample posts
    const posts = [
      {
        title: "Tips for Your First Hackathon",
        content: "Participating in your first hackathon can be exciting and overwhelming. Here are some essential tips to help you succeed: 1) Come prepared with ideas, 2) Focus on execution over perfection, 3) Network with other participants, 4) Don't forget to eat and sleep, 5) Have fun and learn!",
        author: adminUser._id,
        tags: ["Hackathon", "Tips", "Beginner", "Advice"],
        likes: 15,
        comments: []
      },
      {
        title: "Building Scalable APIs with Node.js",
        content: "When building APIs for hackathons, scalability might not be your first concern, but it's good to know the basics. Use proper HTTP status codes, implement rate limiting, structure your routes logically, and always validate input data. These practices will make your API more robust and professional.",
        author: adminUser._id,
        tags: ["API", "Node.js", "Backend", "Development"],
        likes: 23,
        comments: []
      },
      {
        title: "AI Tools That Can Boost Your Hackathon Project",
        content: "Leverage AI tools to accelerate your development: OpenAI API for natural language processing, Hugging Face for pre-trained models, TensorFlow.js for browser-based ML, and GitHub Copilot for code assistance. These tools can help you build impressive prototypes quickly.",
        author: adminUser._id,
        tags: ["AI", "Tools", "Development", "Productivity"],
        likes: 31,
        comments: []
      }
    ];

    console.log("📝 Creating posts...");
    const createdPosts = await Post.insertMany(posts);
    console.log(`✅ Created ${createdPosts.length} posts`);

    // Create sample announcements
    const announcements = [
      {
        title: "Welcome to SyncUp!",
        content: "We're excited to have you join our hackathon community! Explore upcoming events, connect with fellow developers, and access valuable resources to enhance your skills.",
        author: adminUser._id,
        priority: "high",
        expiresAt: new Date("2025-12-31")
      },
      {
        title: "New AI Challenge Starting Soon",
        content: "The AI Innovation Challenge 2025 registration is now open! Don't miss this opportunity to showcase your AI skills and compete for amazing prizes.",
        author: adminUser._id,
        priority: "medium",
        expiresAt: new Date("2025-03-10")
      },
      {
        title: "Platform Maintenance Scheduled",
        content: "We'll be performing routine maintenance on Sunday, February 15th from 2-4 AM PST. The platform may be temporarily unavailable during this time.",
        author: adminUser._id,
        priority: "low",
        expiresAt: new Date("2025-02-20")
      }
    ];

    console.log("📢 Creating announcements...");
    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`✅ Created ${createdAnnouncements.length} announcements`);

    console.log("🎉 Data seeding completed successfully!");
    console.log(`
📊 Summary:
- Hackathons: ${createdHackathons.length}
- Resources: ${createdResources.length}
- Posts: ${createdPosts.length}
- Announcements: ${createdAnnouncements.length}
    `);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seed function
seedData();