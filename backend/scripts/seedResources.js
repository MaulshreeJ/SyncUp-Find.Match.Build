import Resource from "../models/Resource.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const sampleResources = [
  // Frontend Resources
  {
    title: "React Official Documentation",
    description: "The official React documentation with comprehensive guides, API reference, and tutorials for building modern web applications.",
    url: "https://react.dev",
    category: "Frontend",
    type: "documentation",
    difficulty: "Beginner",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    views: 1250,
    likes: []
  },
  {
    title: "CSS Tricks - Complete Guide to Flexbox",
    description: "A comprehensive guide to CSS Flexbox layout with visual examples and practical use cases.",
    url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
    category: "Frontend",
    type: "article",
    difficulty: "Beginner",
    tags: ["CSS", "Flexbox", "Layout", "Frontend"],
    views: 890,
    likes: []
  },
  {
    title: "JavaScript.info - Modern JavaScript Tutorial",
    description: "From the basics to advanced topics with simple explanations and practical examples.",
    url: "https://javascript.info",
    category: "Frontend",
    type: "tutorial",
    difficulty: "Intermediate",
    tags: ["JavaScript", "ES6", "Programming", "Web"],
    views: 2100,
    likes: []
  },

  // Backend Resources
  {
    title: "Node.js Best Practices",
    description: "A comprehensive guide to Node.js best practices, covering security, performance, and code quality.",
    url: "https://github.com/goldbergyoni/nodebestpractices",
    category: "Backend",
    type: "documentation",
    difficulty: "Intermediate",
    tags: ["Node.js", "Backend", "Best Practices", "JavaScript"],
    views: 1560,
    likes: []
  },
  {
    title: "MongoDB University",
    description: "Free online courses for MongoDB, from basics to advanced topics including aggregation and performance tuning.",
    url: "https://university.mongodb.com",
    category: "Backend",
    type: "course",
    difficulty: "Beginner",
    tags: ["MongoDB", "Database", "NoSQL", "Backend"],
    views: 980,
    likes: []
  },
  {
    title: "REST API Design Best Practices",
    description: "Learn how to design clean, scalable, and maintainable REST APIs with industry best practices.",
    url: "https://restfulapi.net",
    category: "Backend",
    type: "article",
    difficulty: "Intermediate",
    tags: ["REST", "API", "Backend", "Architecture"],
    views: 1340,
    likes: []
  },

  // AI & ML Resources
  {
    title: "Fast.ai - Practical Deep Learning",
    description: "Free course that teaches deep learning through practical examples and real-world applications.",
    url: "https://course.fast.ai",
    category: "AI",
    type: "course",
    difficulty: "Intermediate",
    tags: ["AI", "Machine Learning", "Deep Learning", "Python"],
    views: 2450,
    likes: []
  },
  {
    title: "OpenAI API Documentation",
    description: "Official documentation for OpenAI's GPT models and API integration.",
    url: "https://platform.openai.com/docs",
    category: "AI",
    type: "documentation",
    difficulty: "Intermediate",
    tags: ["OpenAI", "GPT", "AI", "API"],
    views: 3200,
    likes: []
  },
  {
    title: "Hugging Face Transformers",
    description: "State-of-the-art Natural Language Processing for PyTorch and TensorFlow 2.0.",
    url: "https://huggingface.co/docs/transformers",
    category: "AI",
    type: "documentation",
    difficulty: "Advanced",
    tags: ["NLP", "Transformers", "AI", "Python"],
    views: 1890,
    likes: []
  },

  // Cloud Resources
  {
    title: "AWS Free Tier Guide",
    description: "Complete guide to AWS Free Tier services and how to build projects without spending money.",
    url: "https://aws.amazon.com/free",
    category: "Cloud",
    type: "documentation",
    difficulty: "Beginner",
    tags: ["AWS", "Cloud", "Free Tier", "DevOps"],
    views: 1670,
    likes: []
  },
  {
    title: "Docker Getting Started",
    description: "Official Docker tutorial to learn containerization from scratch.",
    url: "https://docs.docker.com/get-started/",
    category: "Cloud",
    type: "tutorial",
    difficulty: "Beginner",
    tags: ["Docker", "Containers", "DevOps", "Cloud"],
    views: 2340,
    likes: []
  },
  {
    title: "Kubernetes Basics",
    description: "Learn Kubernetes fundamentals and how to deploy containerized applications.",
    url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
    category: "Cloud",
    type: "tutorial",
    difficulty: "Intermediate",
    tags: ["Kubernetes", "K8s", "Cloud", "DevOps"],
    views: 1450,
    likes: []
  },

  // Mobile Development
  {
    title: "React Native Documentation",
    description: "Build native mobile apps using React and JavaScript.",
    url: "https://reactnative.dev/docs/getting-started",
    category: "Mobile",
    type: "documentation",
    difficulty: "Intermediate",
    tags: ["React Native", "Mobile", "iOS", "Android"],
    views: 1780,
    likes: []
  },
  {
    title: "Flutter Codelabs",
    description: "Hands-on coding tutorials for building beautiful mobile apps with Flutter.",
    url: "https://docs.flutter.dev/codelabs",
    category: "Mobile",
    type: "tutorial",
    difficulty: "Beginner",
    tags: ["Flutter", "Dart", "Mobile", "Cross-platform"],
    views: 1560,
    likes: []
  },

  // Design Resources
  {
    title: "Figma Tutorial for Beginners",
    description: "Learn UI/UX design with Figma from scratch with practical examples.",
    url: "https://www.figma.com/resources/learn-design/",
    category: "Design",
    type: "tutorial",
    difficulty: "Beginner",
    tags: ["Figma", "UI/UX", "Design", "Prototyping"],
    views: 2100,
    likes: []
  },
  {
    title: "Material Design Guidelines",
    description: "Google's comprehensive design system for creating intuitive user interfaces.",
    url: "https://m3.material.io",
    category: "Design",
    type: "documentation",
    difficulty: "Beginner",
    tags: ["Material Design", "UI", "Design System", "Google"],
    views: 1340,
    likes: []
  },

  // DevOps Resources
  {
    title: "GitHub Actions Documentation",
    description: "Automate your workflow with GitHub Actions for CI/CD pipelines.",
    url: "https://docs.github.com/en/actions",
    category: "DevOps",
    type: "documentation",
    difficulty: "Intermediate",
    tags: ["GitHub", "CI/CD", "DevOps", "Automation"],
    views: 1890,
    likes: []
  },
  {
    title: "The Twelve-Factor App",
    description: "Methodology for building modern, scalable, maintainable software-as-a-service apps.",
    url: "https://12factor.net",
    category: "DevOps",
    type: "article",
    difficulty: "Intermediate",
    tags: ["Architecture", "Best Practices", "DevOps", "SaaS"],
    views: 1120,
    likes: []
  },

  // General Programming
  {
    title: "freeCodeCamp",
    description: "Learn to code for free with thousands of hours of interactive coding challenges.",
    url: "https://www.freecodecamp.org",
    category: "General",
    type: "course",
    difficulty: "Beginner",
    tags: ["Programming", "Web Development", "Free", "Learning"],
    views: 4500,
    likes: []
  },
  {
    title: "LeetCode",
    description: "Practice coding problems and prepare for technical interviews.",
    url: "https://leetcode.com",
    category: "General",
    type: "tool",
    difficulty: "Intermediate",
    tags: ["Algorithms", "Data Structures", "Interview Prep", "Coding"],
    views: 3890,
    likes: []
  }
];

const seedResources = async () => {
  try {
    await connectDB();
    
    // Find admin user to use as author
    const User = (await import("../models/User.js")).default;
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please run seedAdmin first.');
      process.exit(1);
    }
    
    console.log(`✅ Using admin user: ${adminUser.name} as author`);
    
    // Clear existing resources
    await Resource.deleteMany({});
    console.log('🗑️  Cleared existing resources');
    
    // Add author to all resources
    const resourcesWithAuthor = sampleResources.map(resource => ({
      ...resource,
      author: adminUser._id
    }));
    
    // Insert sample resources
    await Resource.insertMany(resourcesWithAuthor);
    console.log(`✅ Successfully seeded ${sampleResources.length} learning resources`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding resources:', error);
    process.exit(1);
  }
};

seedResources();
