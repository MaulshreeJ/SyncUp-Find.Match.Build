import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@syncup.ai" });
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "SyncUp Admin",
      email: "admin@syncup.ai",
      password: "admin123", // Will be hashed by the pre-save middleware
      role: "admin",
      title: "Platform Administrator",
      bio: "SyncUp platform administrator with full access to manage hackathons, users, and platform settings.",
      skills: ["Platform Management", "User Administration", "Content Moderation"],
      isActive: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@syncup.ai");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }
};