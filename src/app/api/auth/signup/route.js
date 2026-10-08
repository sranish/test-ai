
import bcrypt from 'bcryptjs';
import User from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { z } from 'zod';

export async function POST(req) {
  try {
    return await signup(req);
  } catch (error) {
    console.error("Signup failed:", error);
    return new Response(JSON.stringify({ message: "Something went wrong. Please try again." }), { status: 500 });
  }
}

async function signup(req) {
  const { email, password, name, role } = await req.json();

  await dbConnect();

  const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    role: z.enum(["student", "working professional"], { message: "Invalid role" }),
  });

  try {
    userSchema.parse({ email, password, name, role });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.errors.map(err => err.message) }), { status: 400 });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  const { password: _, ...userWithoutPassword } = newUser.toObject();

  return new Response(JSON.stringify({ message: "User created successfully", user: userWithoutPassword }), { status: 201 });
}

