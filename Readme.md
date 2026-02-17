# Optigo Report Dashboard
 
A React-based dashboard application for viewing and analyzing various business reports. This application provides interactive interfaces for different types of reports including sales analysis, quote analysis, order completion, factory loss reports, and tag information pricing.
 
## Features
 
- **Multiple Report Types**: Supports various report categories with dynamic loading based on configuration
- **Secure Authentication**: Uses encoded URL parameters and cookies for secure access
- **Modern UI**: Built with Material-UI and Bootstrap for a responsive, professional interface
- **Real-time Data**: Fetches data from centralized APIs
- **Responsive Design**: Optimized for desktop and mobile devices
 
## Supported Reports
 
- Factory Loss Report (PID: 18301)
- Order Completion Report (PID: 18300)
- Quote Analysis Report (PID: 18315)
- Sales Analysis Report (PID: 18314)
- Tag Info Price Report (PID: 18329)
 
## Tech Stack
 
- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) with Bootstrap
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: Emotion (MUI styling), Bootstrap CSS
- **Animations**: Framer Motion
- **Charts/Data Grids**: MUI X Data Grid, MUI X Date Pickers
- **Build Tool**: Create React App (CRA) with custom Webpack configuration
- **Icons**: Material-UI Icons
- **Typography**: Poppins font from Google Fonts
 
## Prerequisites
 
- Node.js (v16 or higher)
- npm or yarn
 
## Installation
 
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd optigo_report_v
   ```
 
2. Install dependencies:
   ```bash
   npm install
   ```
 
3. Create environment variables if needed (for development):
   - The app uses URL parameters and cookies for configuration, no additional env files required for basic setup
 
## Usage
 
1. Start the development server:
   ```bash
   npm start
   ```
 
2. The app will run on `http://localhost:3000` (or the configured port)
 
3. Access reports via URL with proper parameters:
   - The app expects a `CN` parameter in the URL containing encoded configuration data
   - Example: `http://localhost:3000/?CN=<encoded-data>`
 
## Project Structure
 
```
optigo_report_v/
├── public/                 # Static assets
├── src/
│   ├── apis/              # API layer (ReportAPI)
│   ├── components/        # React components for each report type
│   │   ├── FactoryLossReport/
│   │   ├── OrderCompletionReport/
│   │   ├── QuoteAnalysisReport/
│   │   ├── SalesAnalysisReport/
│   │   └── TagInfoPrice/
│   ├── context/           # React contexts
│   ├── libs/              # Utility libraries
│   ├── shared/            # Shared components (Loader, etc.)
│   ├── Entry.js           # Main entry point component
│   ├── Router.js          # React Router configuration
│   └── index.js           # App entry point
├── config/                # Build configuration
├── scripts/               # Build scripts
└── package.json           # Dependencies and scripts
```
 
## API Integration
 
The application communicates with a centralized API endpoint for data retrieval. The API configuration is dynamically set based on the decoded cookie data.
 
- **Base URL**: Configured via cookie data
- **Authentication**: Token-based with encoded parameters
- **Request Format**: JSON POST requests with standardized body structure
 
## Development
 
### Available Scripts
 
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)
 
### Code Style
 
- Uses ESLint for code linting
- Follows React best practices
- Material-UI theming for consistent styling
 
## Deployment
 
The application is configured for deployment to static hosting platforms. The build output in the `build/` directory can be deployed to:
 
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static web server
 
Set the `homepage` field in `package.json` to your deployment URL for proper asset loading.
 
## Security Notes
 
- All authentication data is handled via URL parameters and cookies
- No sensitive information is stored in the client-side code
- API calls include proper token validation
 
## Contributing
 
1. Follow the existing code style and structure
2. Test your changes thoroughly
3. Ensure all new components are responsive and accessible
4. Update documentation as needed