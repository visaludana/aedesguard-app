# **App Name**: AedesGuard AI

## Core Features:

- Larvae Classification: Use a MobileNetV3 model via a Vertex AI Endpoint to classify mosquito larvae as Aedes aegypti or Culex, providing a confidence score.
- Localized Safety Advice: Employ Gemini 3 Flash via Genkit to analyze surroundings and provide localized safety advice based on the detected habitat of mosquito larvae.
- Automated Risk Reporting: Use a Cloud Function triggered by Firebase Storage uploads to resize, normalize, and classify images, generating a 'Risk Report' in Sinhala, Tamil, and English using Genkit.
- Data Storage: Save classification results, including species type, confidence interval, and habitat description, to Firestore.
- Real-time Heatmap Visualization: Integrate Mapbox GL JS to display a real-time heatmap of breeding clusters across Sri Lanka, visualizing data from the Firestore surveillance_map collection.
- Verified Action System: Implement a 'Search & Destroy' feature where users earn points for confirmed breeding site neutralization, verified by AI analysis of a second photo.
- Offline Data Logging: Enable Firestore Offline Data to allow PHIs and citizens to log data in remote areas without internet connectivity.

## Style Guidelines:

- Primary color: Vibrant cyan (#42CBCF) to evoke a sense of health, cleanliness, and awareness.
- Background color: Light cyan (#E2F9FA), a very light tint of the primary, to maintain a bright and clean feel while avoiding eye strain.
- Accent color: Blue (#4281CB), analogous to the primary color, to draw attention to key interactive elements such as calls to action.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, minimalist icons to represent data points and actions, ensuring legibility on the heatmap and throughout the app.
- Incorporate subtle transitions and animations to provide feedback during user interactions, such as data uploads or heatmap updates, enhancing the user experience.