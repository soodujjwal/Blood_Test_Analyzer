import { getDatabase } from './mongodb';
import bcrypt from 'bcryptjs';

// User Service - Handle all user-related database operations

export async function createUser(userData) {
  const db = getDatabase();
  const usersCollection = db.collection('users');

  try {
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    // Insert new user
    const result = await usersCollection.insertOne({
      email: userData.email,
      full_name: userData.full_name,
      password_hash,
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      id: result.insertedId,
      email: userData.email,
      full_name: userData.full_name,
      created_at: new Date()
    };
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

export async function getUserByEmail(email) {
  const db = getDatabase();
  const usersCollection = db.collection('users');

  try {
    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

export async function getUserById(userId) {
  const db = getDatabase();
  const usersCollection = db.collection('users');
  const { ObjectId } = require('mongodb');

  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
