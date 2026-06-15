# Feature Desk - Database Setup Guide

## Overview

Feature Desk uses a **Hybrid Database Architecture**:
- **Supabase (PostgreSQL)**: Structured data (users, grades, schedules, results)
- **MongoDB Atlas**: Unstructured data (PDFs, AI analysis, detailed logs, canvas strokes)

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: feature-desk
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Wait for project to be created (~2 minutes)

### Step 2: Get Connection Details
1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

### Step 3: Update Environment Variables
Add to your `.env` file:
```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### Step 4: Run Database Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste the contents of `database/supabase_schema.sql`
4. Click **Run**

### Step 5: Load Demo Data
1. In SQL Editor, create a new query
2. Copy and paste the contents of `database/demo_data_class7.sql`
3. Click **Run**

This will create:
- ✅ 100 Class 7 students with realistic Indian names
- ✅ 6 subjects (Math, Science, English, Hindi, Social, Computer)
- ✅ 14 assessments (unit tests, quizzes, mid-terms)
- ✅ ~1000+ quiz results with varied scores
- ✅ 30 days of attendance records
- ✅ Leaderboard data for all students
- ✅ Student notes
- ✅ Peer help requests
- ✅ Notifications

---

## 🍃 MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up or sign in
3. Create a new **Free Tier** cluster

### Step 2: Create Cluster
1. Choose **Shared (Free)**
2. Select provider: **AWS**
3. Select region: **Mumbai (ap-south-1)** for India
4. Cluster name: `feature-desk-cluster`
5. Click **Create Cluster**

### Step 3: Create Database User
1. Go to **Database Access**
2. Click **Add New Database User**
3. Authentication: **Password**
4. Username: `featuredex_user`
5. Password: Generate or create a strong password
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 4: Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 5: Get Connection String
1. Go to **Database** → **Connect**
2. Choose **Drivers**
3. Copy the connection string:
   ```
   mongodb+srv://featuredex_user:<password>@feature-desk-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 6: Update Environment Variables
Add to your `.env` file:
```env
VITE_MONGODB_URI=mongodb+srv://featuredex_user:your-password@feature-desk-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
VITE_MONGODB_DB_NAME=featuredex_db
```

### Step 7: Create Collections (Automatic)
Collections are created automatically when data is first inserted. The following collections will be used:
- `detailed_quiz_logs` - Detailed answer logs
- `canvas_data` - Handwriting canvas strokes
- `ai_learning_models` - Personalized AI models
- `study_materials_content` - PDF content and AI analysis
- `chat_history` - AI chatbot conversations
- `mistake_patterns` - AI-detected mistake patterns
- `code_studio_sessions` - Live code sharing sessions

---

## 📊 Database Schema Overview

### Supabase Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `classes` | School classes (1-12) | id, class_name, section |
| `subjects` | Subject master | code, subject_name, color |
| `students` | Student records | roll_number, student_name, current_class |
| `teachers` | Teacher records | email, teacher_name, assigned_class |
| `assessments` | Quizzes/tests/exams | title, exam_type, questions(JSONB) |
| `quiz_results` | Student scores | score, grade, teacher_approved |
| `student_notes` | Student notes | title, content, note_type |
| `leaderboard` | Points & rankings | total_points, current_rank, badges |
| `student_attendance` | Daily attendance | status (present/absent/late) |
| `notifications` | Announcements | title, message, priority |
| `peer_help_requests` | Study help requests | topic, status, requester/helper |
| `peer_sessions` | Help sessions | rating, feedback |
| `student_interactions` | Activity tracking | interaction_type, duration |

### MongoDB Collections

| Collection | Purpose | Sample Document Size |
|------------|---------|---------------------|
| `detailed_quiz_logs` | Per-question analytics | ~5-20 KB |
| `canvas_data` | Drawing strokes | ~50-500 KB |
| `study_materials_content` | PDF base64 + analysis | ~1-10 MB |
| `chat_history` | AI conversations | ~10-50 KB |
| `ai_learning_models` | Personalized models | ~5-20 KB |
| `mistake_patterns` | Class analytics | ~10-30 KB |

---

## 🔐 Demo Login Credentials

### Teacher Login
- **Email**: `teacher@demo.com`
- **Password**: `teacher123`

### Student Login
Any of the 100 students can login with:
- **Roll Number**: `7A001` to `7A100`
- **Password**: `123456`

**Sample Students**:
| Roll Number | Name | Gender |
|-------------|------|--------|
| 7A001 | Aarav Sharma | Male |
| 7A002 | Aanya Patel | Female |
| 7A010 | Diya Nair | Female |
| 7A025 | Sahil Chatterjee | Male |
| 7A050 | Gauri Patil | Female |
| 7A100 | Nandini Sen | Female |

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FEATURE DESK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Student   │    │   Teacher   │    │    Admin    │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                    ┌───────▼───────┐                       │
│                    │   Frontend    │                       │
│                    │   (React)     │                       │
│                    └───────┬───────┘                       │
│                            │                               │
│         ┌──────────────────┼──────────────────┐           │
│         │                  │                  │           │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐    │
│  │  Supabase   │   │   MongoDB   │   │  Gemini AI  │    │
│  │ (PostgreSQL)│   │   (Atlas)   │   │   (API)     │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                             │
│  Structured Data:  Unstructured:    AI Features:           │
│  - Users           - PDF Content    - Question Gen         │
│  - Grades          - Canvas Data    - Grading Assist       │
│  - Schedules       - AI Models      - Chatbot              │
│  - Leaderboard     - Chat Logs      - Summaries            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Supabase Issues

**Error: "relation does not exist"**
- Make sure you ran the schema SQL first before the demo data SQL

**Error: "permission denied"**
- Check that RLS policies are correctly set up
- For demo, all policies are set to allow all operations

**Error: "connection refused"**
- Verify your Supabase URL and anon key in `.env`

### MongoDB Issues

**Error: "Authentication failed"**
- Double-check your password in the connection string
- Ensure the database user is created

**Error: "Network error"**
- Verify your IP is whitelisted in Network Access
- For development, allow 0.0.0.0/0

**Error: "Bridge Server Offline"**
- For local bridge mode, run: `npm run start:db`
- Or use MongoDB Data API for serverless access

---

## 📱 Testing the Setup

### Verify Supabase Connection
```javascript
// In browser console or React component
import { supabase } from './lib/supabase';

const { data, error } = await supabase.from('students').select('count');
console.log('Students count:', data);
```

### Verify MongoDB Connection
```javascript
// In browser console or React component
import { mongoDb } from './lib/db';

const result = await mongoDb.find('canvas_data', {});
console.log('Canvas data:', result);
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change default passwords
- [ ] Enable Row Level Security (RLS) properly
- [ ] Set up proper network restrictions for MongoDB
- [ ] Enable Supabase email verification
- [ ] Configure CORS origins
- [ ] Set up database backups
- [ ] Monitor database usage and costs
- [ ] Set up proper indexes for performance

---

## 📞 Support

For issues or questions:
- Check the documentation above
- Review console logs for errors
- Verify environment variables
- Check Supabase/MongoDB dashboards for status

Happy coding! 🎉
