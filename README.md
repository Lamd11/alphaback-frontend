# AlphaBack Frontend

Simple React frontend for uploading trading models to the AlphaBack system.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Model Upload Service API Gateway URL:

```
VITE_MODEL_UPLOAD_API_URL=https://your-api-gateway-url.amazonaws.com/prod/upload
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## How It Works

### Upload Flow

1. **User selects .class file** - Only Java compiled class files are accepted
2. **Request pre-signed URL** - Frontend calls Model Upload Service API
3. **Upload to S3** - File is uploaded directly to S3 using the pre-signed URL
4. **Show success** - Display the model_id to the user

### Architecture

```
User → Frontend → Model Upload Service (Lambda) → S3
                         ↓
                  DynamoDB (Upload Status Table)
                         ↓
                  Model Registry ← Verify Service
```

### Key Files

- `src/App.jsx` - Main upload UI component
- `src/services/uploadService.js` - API integration logic
- `src/App.css` - Component styling

## Features

- File validation (only .class files)
- Upload progress indicator
- Error handling with user-friendly messages
- Success confirmation with model ID
- Clean, modern UI

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MODEL_UPLOAD_API_URL` | Model Upload Service endpoint | `https://abc.execute-api.us-east-1.amazonaws.com/prod/upload` |

## Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
