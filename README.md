# DataCruxx - AI-Powered Analytics Platform

DataCruxx is a modern, AI-powered analytics platform that transforms your data files into actionable insights. Upload CSV, PDF, Excel, or text files and get beautiful dashboards, comprehensive analytics, and intelligent insights powered by Google Gemini AI.

## 🚀 Features

- **AI-Powered Analysis**: Advanced AI analyzes your data and automatically generates insights, charts, and recommendations
- **Multiple File Formats**: Support for CSV, PDF, Excel (.xlsx, .xls), and text files
- **Beautiful Visualizations**: Interactive charts and graphs with export capabilities (PDF/PNG)
- **Secure Authentication**: Email/password and Google OAuth integration
- **Admin Blog Management**: Content management system for publishing data insights
- **Dark/Light Mode**: Responsive design with theme switching
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Complete SEO metadata and OpenGraph support

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom ProximaB theme
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Google Cloud Platform** account (for Gemini API)
- A **Firebase** account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd datacruxx
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Step 3.1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `datacruxx` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 3.2: Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", add your project support email, and save

#### Step 3.3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll configure security rules later)
3. Select your preferred location
4. Click "Done"

#### Step 3.4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon (`</>`)
4. Register app name: `datacruxx-web`
5. Copy the Firebase configuration object

#### Step 3.5: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own dashboards
    match /dashboards/{dashboardId} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    
    // Upload limits - users can read/write their own limits
    match /uploadLimits/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Blogs - public read, admin write
    match /blogs/{blogId} {
      allow read: if resource.data.published == true;
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click "Publish"

### 4. Google Gemini API Setup

#### Step 4.1: Enable Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 5. Environment Configuration

#### Step 5.1: Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

#### Step 5.2: Configure Environment Variables

Edit the `.env` file with your Firebase and Gemini configurations:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Replace all placeholder values with your actual Firebase and Gemini API credentials.

### 6. Create Admin User

#### Step 6.1: Run the Application

```bash
npm run dev
```

#### Step 6.2: Register Admin Account

1. Open your browser and go to `http://localhost:5173`
2. Click "Sign Up" and create an account with your admin email
3. After registration, go to Firebase Console → Firestore Database
4. Find your user document in the `users` collection
5. Edit the document and change the `role` field from `"user"` to `"admin"`

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard-related components
│   ├── Layout/         # Layout components
│   ├── SEO/           # SEO components
│   └── UI/            # Generic UI components
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── config/            # Configuration files
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # Global styles
```

## 🔐 User Roles & Permissions

### Regular Users
- Upload data files (10 files per day limit)
- Generate AI-powered dashboards
- View and export dashboards
- Read published blog posts

### Admin Users
- All regular user permissions
- Create, edit, and manage blog posts
- Access admin dashboard
- Use AI assistance for blog content

## 📊 Usage Guide

### For Regular Users

1. **Sign Up/Login**: Create an account or sign in
2. **Upload Data**: Go to Dashboard → Upload Data
3. **Generate Insights**: AI will automatically analyze your file
4. **View Dashboard**: Explore charts, metrics, and AI summary
5. **Export**: Download dashboards as PDF or PNG

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Create Blog Posts**: Use the blog editor with AI assistance
3. **Manage Content**: Edit, publish, or delete blog posts
4. **Monitor Analytics**: View blog statistics and user engagement

## 🔧 Configuration Options

### File Upload Limits

- **Supported formats**: CSV, PDF, Excel (.xlsx, .xls), Text (.txt)
- **Maximum file size**: 10MB
- **Daily upload limit**: 10 files per user

### AI Features

- **Dashboard Generation**: Automatic chart suggestions and insights
- **Blog Enhancement**: Title suggestions, summaries, and SEO optimization
- **Data Analysis**: Pattern recognition and anomaly detection

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Auth Error**: Ensure your API keys are correctly set in `.env`
2. **Gemini API Error**: Verify your Gemini API key and quota limits
3. **File Upload Issues**: Check file format and size restrictions
4. **Build Errors**: Clear node_modules and reinstall dependencies

### Debug Steps

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
echo $VITE_FIREBASE_API_KEY

# Verify Firebase connection
npm run dev
```

## 🔒 Security Considerations

- All API keys are environment variables (never commit to version control)
- Firestore security rules enforce user data isolation
- File uploads are validated client-side and server-side
- Admin routes are protected with role-based access control

## 📈 Performance Optimization

- Lazy loading for dashboard components
- Image optimization for blog posts
- Code splitting for better load times
- Caching strategies for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Firebase and Gemini API documentation

## 🔄 Updates & Maintenance

- Regularly update dependencies for security patches
- Monitor Firebase usage and billing
- Check Gemini API quota and usage limits
- Backup Firestore data regularly

---

**Built with ❤️ using React, Firebase, and Google Gemini AI**