# PIXEE - AI Face Recognition for Event Photos

**Upload a selfie → Find your memories instantly**

PIXEE helps users find all photos containing their face among 500+ event photos using client-side AI face recognition.

## 🎯 Features

- **Privacy First**: All AI processing runs on your device
- **Smart Matching**: Advanced face detection using face-api.js
- **Admin Panel**: Event creation and photo management
- **User Portal**: Upload selfie and discover your event photos

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (TypeScript, App Router)
- **Backend & DB**: Supabase
- **AI**: face-api.js (client-side face recognition)
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup Steps

1. **Clone repository**
   ```bash
   cd pixee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   copy env.example.txt .env.local
   ```
   
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Setup Supabase Database**
   
   (SQL schema will be provided in Phase 2)

5. **Download Face Detection Models**
   
   Download face-api.js models and place in `/public/models/`:
   - tiny_face_detector_model-weights_manifest.json
   - face_landmark_68_model-weights_manifest.json
   - face_recognition_model-weights_manifest.json
   
   Models available at: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
pixee/
├── app/
│   ├── page.tsx          # Landing page
│   ├── admin/
│   │   └── page.tsx      # Admin panel
│   └── find/
│       └── page.tsx      # User face matching
├── lib/
│   ├── supabase.ts       # Supabase client & types
│   └── faceDetection.ts  # Face-api.js utilities
├── public/
│   └── models/           # Face detection models (to be added)
└── env.example.txt       # Environment variables template
```

## 🗄️ Database Schema

### Events Table
```sql
id          uuid
name        text
code        text (unique)
created_at  timestamp
```

### Photos Table
```sql
id          uuid
event_id    uuid (fk → events.id)
image_url   text
created_at  timestamp
```

## 🎨 Pages

1. **Landing Page** (`/`)
   - App introduction
   - Navigation to admin and find pages

2. **Admin Panel** (`/admin`)
   - Login with Supabase Auth
   - Create events
   - Upload photo URLs

3. **Find Photos** (`/find`)
   - Select event
   - Upload selfie
   - AI face matching
   - Display matched photos

## 🔧 Development Phases

- ✅ **Phase 1**: Project setup & dependencies
- ⏳ **Phase 2**: Supabase schema & configuration
- ⏳ **Phase 3**: Admin page implementation
- ⏳ **Phase 4**: AI model integration
- ⏳ **Phase 5**: Face matching functionality
- ⏳ **Phase 6**: Deployment to Vercel

## 📝 License

MIT
