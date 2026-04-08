# MongoDB Schema Setup Guide

## Collections Created

### 1. **users** Collection
Stores user account information.

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `email` (String) - Email address (unique index needed)
- `full_name` (String) - User's full name
- `password_hash` (String) - Bcrypt hashed password
- `created_at` (Date) - Account creation timestamp
- `updated_at` (Date) - Last update timestamp

**Indexes to Create:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

---

### 2. **analysis_history** Collection
Stores blood test analysis records for each user.

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `user_id` (ObjectId) - Reference to user
- `results` (Array) - Array of test results with name, value, unit
- `patient_info` (Object) - Optional patient demographics (age, gender, notes)
- `analysis_response` (Object) - AI analysis with summary, details, suggestions, recipes, grocery_list
- `created_at` (Date) - Analysis creation timestamp

**Indexes to Create:**
```javascript
db.analysis_history.createIndex({ user_id: 1 })
db.analysis_history.createIndex({ created_at: -1 })
db.analysis_history.createIndex({ user_id: 1, created_at: -1 })
```

---

## How to Apply Schemas in MongoDB Atlas

### Option 1: Using MongoDB Atlas UI (Recommended)

1. Go to MongoDB Atlas → Your Cluster → Collections
2. Click "Create Database"
3. Create collections: `users` and `analysis_history`
4. For each collection, click **⋯ → Edit Collection Schema**
5. Copy the JSON schema from `mongoSchemas.js` and paste it

### Option 2: Using MongoDB Shell

```javascript
// Connect to your database
use your_database_name

// Create users collection with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      // Paste userSchema from mongoSchemas.js
    }
  }
})

// Create analysis_history collection with validation
db.createCollection("analysis_history", {
  validator: {
    $jsonSchema: {
      // Paste analysisHistorySchema from mongoSchemas.js
    }
  }
})

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.analysis_history.createIndex({ user_id: 1 })
db.analysis_history.createIndex({ created_at: -1 })
db.analysis_history.createIndex({ user_id: 1, created_at: -1 })
```

### Option 3: Using Node.js Driver

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function setupDatabase() {
  try {
    await client.connect();
    const db = client.db('blood_test_analyzer');

    // Import schemas
    const { mongoDBValidation } = require('./schemas/mongoSchemas');

    // Create collections with validation
    await db.createCollection("users", mongoDBValidation.users);
    await db.createCollection("analysis_history", mongoDBValidation.analysis_history);

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("analysis_history").createIndex({ user_id: 1 });
    await db.collection("analysis_history").createIndex({ created_at: -1 });
    await db.collection("analysis_history").createIndex({ user_id: 1, created_at: -1 });

    console.log("✅ Database schemas and indexes created successfully!");
  } catch (error) {
    if (error.codeName === 'NamespaceExists') {
      console.log("⚠️ Collections already exist");
    } else {
      console.error("❌ Error setting up database:", error);
    }
  } finally {
    await client.close();
  }
}

setupDatabase();
```

---

## Environment Variables

Add to your `.env.example` and `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blood_test_analyzer?retryWrites=true&w=majority
```

---

## Using Schemas in Your Code

```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

// Insert user
const usersCollection = db.collection('users');
await usersCollection.insertOne({
  email: "user@example.com",
  full_name: "John Doe",
  password_hash: "hashed_password",
  created_at: new Date(),
  updated_at: new Date()
});

// Insert analysis
const historyCollection = db.collection('analysis_history');
await historyCollection.insertOne({
  user_id: userId,
  results: [/* blood test results */],
  patient_info: { age: 30, gender: "M" },
  analysis_response: {/* analysis data */},
  created_at: new Date()
});
```

---

## Schema Validation Benefits

✅ **Data Integrity** - Invalid data is rejected at the database level  
✅ **Type Safety** - Ensures correct data types  
✅ **Required Fields** - Enforces required fields  
✅ **Enum Validation** - Gender, status fields must match allowed values  
✅ **Email Validation** - Email format is validated  
✅ **Unique Constraints** - Email uniqueness enforced via index  

