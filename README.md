# IRCTC Clone Project

A clone of the Indian Railway Catering and Tourism Corporation (IRCTC) website, built using modern web technologies.

## Features

- User authentication (login/signup)
- Train search functionality
- Seat booking system
- Payment integration
- Admin dashboard
- Responsive design

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT)
- Styling: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/irctc-clone.git
```

2. Install dependencies:
```bash
cd irctc-clone
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
irctc-clone/
├── client/          # Frontend React application
├── server/          # Backend Node.js application
├── public/          # Static files
└── config/          # Configuration files
```

## Dependencies

### Backend Dependencies
- express: Web framework for Node.js
- mongoose: MongoDB object modeling tool
- jsonwebtoken: JWT implementation for authentication
- bcryptjs: Password hashing
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management
- morgan: HTTP request logger
- stripe: Payment processing
- validator: String validation and sanitization

### Development Dependencies
- nodemon: Development server with auto-reload
- concurrently: Run multiple commands concurrently

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- IRCTC for inspiration
- All contributors who helped with the project
