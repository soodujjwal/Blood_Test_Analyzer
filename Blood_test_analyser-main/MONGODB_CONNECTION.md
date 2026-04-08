# MongoDB Connection Setup Guide

## Step 1: Get Your MongoDB Atlas Connection String

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. Sign in → Select your cluster
3. Click **"Connect"** button
4. Select **"Drivers"** → **Node.js** → version 4.0 or later
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 2: Set Up Environment Variables

1. Create `.env` file in `frontend/` directory (copy from `.env.example`):
   ```bash
   VITE_MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/blood_test_analyzer?retryWrites=true&w=majority
   ```

2. Replace:
   - `YOUR_USERNAME` - MongoDB Atlas username
   - `YOUR_PASSWORD` - MongoDB Atlas password
   - `YOUR_CLUSTER` - Your cluster name (e.g., cluster0)

3. **⚠️ Important:** Add `.env` to `.gitignore` (don't commit credentials!)

## Step 3: Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- `mongodb` - Node.js driver for MongoDB
- `bcryptjs` - For password hashing

## Step 4: Initialize MongoDB Connection in Your App

In your main app entry point (e.g., `main.jsx`):

```javascript
import { connectToDatabase } from './services/mongodb';

// Connect to MongoDB on app start
try {
  await connectToDatabase();
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Failed to connect:', error);
}

// Your React app code...
```

## Step 5: Use Database Services

Now you can use the services in your components:

### Example: Sign Up

```javascript
import { createUser } from './services/userService';

async function handleSignUp(email, password, fullName) {
  try {
    const user = await createUser({
      email,
      password,
      full_name: fullName
    });
    console.log('User created:', user);
  } catch (error) {
    console.error('Signup failed:', error.message);
  }
}
```

### Example: Save Blood Test Analysis

```javascript
import { saveAnalysis } from './services/analysisService';

async function handleAnalysis(userId, results, analysisResponse) {
  try {
    const saved = await saveAnalysis(userId, {
      results,
      patient_info: { age: 30, gender: 'M' },
      analysis_response: analysisResponse
    });
    console.log('Analysis saved:', saved.id);
  } catch (error) {
    console.error('Save failed:', error.message);
  }
}
```

### Example: Get User History

```javascript
import { getAnalysisHistory } from './services/analysisService';

async function loadHistory(userId) {
  try {
    const history = await getAnalysisHistory(userId, 10);
    console.log('History:', history);
  } catch (error) {
    console.error('Load failed:', error.message);
  }
}
```

## Available Services

### `userService.js`
- `createUser(userData)` - Create new user account
- `getUserByEmail(email)` - Find user by email
- `getUserById(userId)` - Find user by ID
- `verifyPassword(plain, hashed)` - Verify password

### `analysisService.js`
- `saveAnalysis(userId, data)` - Save blood test analysis
- `getAnalysisHistory(userId, limit)` - Get user's analyses
- `getAnalysisById(id)` - Get specific analysis
- `deleteAnalysis(id, userId)` - Delete analysis
- `updateAnalysis(id, userId, data)` - Update analysis

## Troubleshooting

### Connection Error: "ECONNREFUSED"
- Check MongoDB URI is correct
- Verify IP whitelist in MongoDB Atlas (Network Access)
- Ensure `.env` file exists with correct credentials

### Error: "VITE_MONGODB_URI is not defined"
- Make sure `.env` file exists in `frontend/` directory
- Restart dev server after creating `.env`
- Prefix must be `VITE_` for Vite to expose to client

### Authentication Failed
- Double-check username and password in connection string
- Ensure special characters are URL-encoded (% symbol)
- Example: password `my@pass` should be `my%40pass`

### Collections Don't Exist
- Run schema setup from `MONGODB_SETUP.md`
- Create collections manually in MongoDB Atlas UI
- Use the setup script provided in `MONGODB_SETUP.md`

## Security Notes

⚠️ **Never commit `.env` file with credentials!**

For production:
- Use environment variables on your hosting platform (Vercel, Netlify, etc.)
- Use MongoDB Atlas IP whitelist
- Enable network encryption
- Use strong passwords
- Rotate credentials regularly

