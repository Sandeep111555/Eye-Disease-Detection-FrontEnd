# Eye Disease Detection Web Application

This is a web application that uses a TensorFlow model to detect eye diseases from uploaded images.

## Features

- User authentication (registration and login)
- Upload eye images for disease detection
- AI-powered analysis of eye conditions
- View analysis history and details
- User profile management

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: FastAPI with TensorFlow
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- TensorFlow 2.x

### Backend Setup

1. Install the required Python packages:

```bash
pip install fastapi uvicorn tensorflow pillow python-multipart
```

2. Place the `EyeDiseaseDetection.h5` model file in the same directory as `FastApiApp.py`

3. Start the FastAPI server:

```bash
uvicorn FastApiApp:app --reload --port 8000
```

The backend will run on http://localhost:8000

### Frontend Setup

1. Install the dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The application will open in your browser at http://localhost:3000

## Usage

1. Register a new account or login with existing credentials
2. Upload an eye image on the dashboard
3. View the AI-powered analysis results
4. Check your analysis history

## Eye Conditions Detected

- Cataract
- Diabetic Retinopathy
- Glaucoma
- Normal (healthy eye)

## Documentation

For more detailed information, refer to:

- [FASTAPI_INTEGRATION.md](./FASTAPI_INTEGRATION.md) - Instructions on integrating the FastAPI backend
- [CORS_SETUP.md](./CORS_SETUP.md) - Information on CORS configuration

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## License

This project is licensed under the MIT License.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
