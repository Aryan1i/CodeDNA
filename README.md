🧬 CodeDNA

«A full-stack developer platform built to explore, analyze, and visualize a developer's coding journey.»

CodeDNA is a full-stack web application designed to bring coding-related data into one place and turn it into meaningful insights about a developer's programming journey.

The project is being developed with a focus on full-stack engineering, backend architecture, REST APIs, database integration, and modern frontend development.

---

🌐 Live Application

🚀 "Visit CodeDNA" (https://code-dna-pi.vercel.app/)

📦 "GitHub Repository" (https://github.com/Aryan1i/CodeDNA)

---

✨ What is CodeDNA?

Every developer leaves behind a trail of code — projects, problems solved, technologies used, coding activity, and patterns of learning.

CodeDNA aims to turn this data into a developer profile that represents their coding identity.

Instead of looking at individual repositories or coding-platform statistics in isolation, CodeDNA is being built around the idea of creating a centralized view of a developer's technical journey.

Core idea

Coding Activity
      │
      ▼
   CodeDNA
      │
      ├── Data Collection
      ├── Processing
      ├── Backend APIs
      └── Developer Insights
               │
               ▼
        Developer Profile

---

🏗️ Architecture

CodeDNA follows a separated frontend-backend architecture.

                    ┌─────────────────────┐
                    │      Developer      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Frontend       │
                    │                     │
                    │  React Application  │
                    └──────────┬──────────┘
                               │
                          HTTP / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │                     │
                    │    Spring Boot     │
                    │     REST APIs      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Database       │
                    └─────────────────────┘

The repository is intentionally divided into independent frontend and backend applications.

---

📁 Repository Structure

CodeDNA/
│
├── codedna-frontend/
│   └── Frontend application
│
├── codedna-backend/
│   └── Backend application
│
├── .gitignore
└── README.md

"codedna-frontend"

Contains the client-side application responsible for the user interface and interaction with the backend APIs.

"codedna-backend"

Contains the server-side application responsible for business logic, APIs, data processing, and communication with the database.

---

🛠️ Tech Stack

Frontend

- React
- JavaScript
- HTML
- CSS
- Vite

Backend

- Java
- Spring Boot
- REST APIs

Database

- Relational database
- SQL

Development Tools

- Git
- GitHub
- VS Code / Eclipse
- Maven
- npm

---

🔑 Key Engineering Concepts

While building CodeDNA, the project focuses on practical implementation of several software engineering concepts:

Backend

- RESTful API design
- Layered backend architecture
- Request/response handling
- Business logic separation
- Database integration
- Dependency management
- Exception handling

Frontend

- Component-based architecture
- API integration
- State management
- Responsive UI
- Client-side routing

Development

- Git version control
- Repository organization
- Environment configuration
- Frontend/backend separation
- Deployment

---

🔄 Application Flow

A typical request follows this flow:

User
 │
 │ interacts with UI
 ▼
React Frontend
 │
 │ HTTP Request
 ▼
Spring Boot REST API
 │
 │ Business Logic
 ▼
Database
 │
 │ Data
 ▼
Spring Boot Backend
 │
 │ JSON Response
 ▼
React Frontend
 │
 ▼
User

This separation allows the frontend and backend to evolve independently while communicating through well-defined APIs.

---

🚀 Getting Started

Prerequisites

Make sure you have the following installed:

- Java
- Maven
- Node.js
- npm
- Git
- SQL database

---

1. Clone the Repository

git clone https://github.com/Aryan1i/CodeDNA.git

cd CodeDNA

---

2. Start the Backend

cd codedna-backend

Configure the required database and environment variables.

Then run the Spring Boot application using Maven:

mvn spring-boot:run

---

3. Start the Frontend

Open another terminal:

cd codedna-frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will be available at the local development URL displayed by Vite.

---

🔐 Environment Variables

Sensitive configuration should not be committed to GitHub.

Create the appropriate environment configuration for your local setup.

Typical configuration may include:

DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
BACKEND_URL=

«Never commit passwords, API keys, tokens, or other secrets to the repository.»

---

📡 Backend API

The backend exposes REST endpoints that allow the frontend to communicate with the application server.

A typical API interaction follows:

GET /api/...

POST /api/...

Frontend
   │
   │ JSON Request
   ▼
REST Controller
   │
   ▼
Service Layer
   │
   ▼
Repository / Database

As the project evolves, detailed API documentation can be added here.

---

🎯 Project Goals

CodeDNA is being developed with several goals in mind:

- Build a real-world full-stack application
- Practice professional backend development
- Understand frontend-backend communication
- Work with relational databases
- Design and consume REST APIs
- Improve software architecture skills
- Learn deployment and production workflows
- Build a meaningful developer-focused product

---

📈 Future Improvements

CodeDNA is an evolving project.

Potential improvements include:

- 📊 Advanced developer analytics
- 📈 Coding activity visualization
- 🧩 Developer technology profiles
- 🔗 Integration with coding platforms
- 🏆 Developer achievements
- 📅 Coding activity timelines
- 🔍 More detailed developer insights
- 🔐 Authentication and user profiles
- ☁️ Production-ready deployment
- 📚 API documentation

---

🧪 Development Philosophy

The project is being developed incrementally.

Rather than building everything at once, CodeDNA focuses on implementing individual components, understanding the underlying technologies, and gradually improving the architecture.

This makes the repository both a real-world application and a practical record of my full-stack development journey.

---

📸 Screenshots

«Screenshots will be added as the application UI develops.»

<!--
Add screenshots here:

![Dashboard](./screenshots/dashboard.png)

![Profile](./screenshots/profile.png)
-->---

🗺️ Roadmap

[✓] Project Initialization
 │
 ├── [✓] Frontend Setup
 │
 ├── [✓] Backend Setup
 │
 ├── [✓] Frontend ↔ Backend Communication
 │
 ├── [ ] Advanced Features
 │
 ├── [ ] Analytics & Visualizations
 │
 ├── [ ] Authentication
 │
 └── [ ] Production Improvements

---

🤝 Contributing

This project is primarily developed as a personal learning and portfolio project.

However, suggestions, feedback, and ideas are always welcome.

If you find an issue or have an improvement in mind, feel free to open an issue or submit a pull request.

---

👨‍💻 Author

Aryan Gupta

Computer Science student and developer interested in Java, Spring Boot, backend development, databases, and full-stack engineering.

- GitHub: "@Aryan1i" (https://github.com/Aryan1i)

---

⭐ Support

If you find CodeDNA interesting, consider giving the repository a ⭐ on GitHub.

---

«CodeDNA — Understand the code. Discover the developer.»
