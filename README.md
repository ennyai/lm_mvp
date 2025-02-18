# Lean Marketing MVP

A React-based UI that allows authenticated clients to upload documents, initiate AI queries, and view results. The app connects to n8n webhooks to trigger back-end workflows.

## Features

- 🔐 User Authentication with Supabase
- 📄 Document Upload
- 🤖 AI-Powered Document Analysis
- 📊 Business Intelligence Queries
- 🔄 Real-time Updates
- 📱 Responsive Design

## Tech Stack

- **Frontend Framework:** React with TypeScript
- **UI Library:** Ant Design (AntD)
- **Authentication:** Supabase Auth
- **Backend Integration:** n8n workflows via webhooks
- **Build Tool:** Vite
- **State Management:** React Context API
- **Routing:** React Router v6

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- n8n instance

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd lm_MVP
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

### Environment Setup

Make sure to set up the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Available Scripts

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn preview`: Preview production build
- `yarn lint`: Run ESLint

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is private and confidential.

## Contact

For any queries, please contact [Your Contact Information]
