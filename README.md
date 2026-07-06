# 🍔 Foodify — Real-Time Microservices Food Delivery Platform

Foodify is an advanced, production-grade food delivery web application built with modern distributed system principles. It transitions away from traditional monolithic backends by utilizing a **Microservices Architecture** to ensure high availability, fault tolerance, and horizontal scalability.

## ✨ Key Features

* **🎭 Multi-Role Portals:** Tailored dashboards for Customers, Restaurant Sellers, Delivery Riders, and Platform Admins.
* **📍 Live Geospatial Tracking:** Real-time delivery tracking and distance calculation using **React Leaflet** and **OpenStreetMap** APIs.
* **⚡ Asynchronous Event-Driven Flow:** Uses **RabbitMQ** message queues to decouple heavy operations (like payment processing and nearby rider discovery) from main application threads.
* **🔄 Dedicated Real-time Hub:** An isolated **Socket.io** WebSocket service designed specifically to push instant order status alerts without loading down core HTTP APIs.
* **🔐 Stateless & Secure:** Role-based access control and stateless authentication powered by **JSON Web Tokens (JWT)**.
* **🛡️ Defensive UI/UX:** Built with smart API fallback mechanisms to ensure graceful degradation if individual microservices experience latency or downtime.

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Socket.io Client, React Leaflet
* **Backend Services:** Node.js, Express.js (TypeScript)
* **Database:** MongoDB (Mongoose ODM)
* **Message Broker:** RabbitMQ (`amqplib`)
* **Real-time Engine:** Socket.io
* **Cloud & DevOps:** Cloudinary (Media Storage), Docker, GitHub Actions (CI/CD Pipelines), Render

## 🏗️ Microservices Architecture

Foodify is divided into 6 highly specialized backend services:
1. **Auth Service:** Manages user identity, registration, and stateless JWT sessions.
2. **Restaurant Service:** Core business engine handling restaurant catalogs, shopping carts, and order lifecycles.
3. **Rider Service:** Manages delivery logistics, rider verifications, and geospatial `$near` queries to dispatch orders to nearby available riders.
4. **Realtime Service:** A dedicated WebSocket server handling live map coordinate streaming and instant pop-up notifications.
5. **Utils Service:** Manages heavy 3rd-party network calls including Cloudinary image uploads and payment gateway processing.
6. **Admin Service:** Platform-wide analytics dashboard and verification control center.
