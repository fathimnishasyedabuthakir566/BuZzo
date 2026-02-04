# Buzzo - Live Bus Tracking & Management System
Buzzo is a comprehensive MERN stack web application designed for real-time bus tracking and fleet management. It connects passengers, drivers, and administrators in a single seamless platform.
## 🚀 Key Features
*   **Real-Time Bus Tracking**: Use of **Socket.io** to track bus locations live on the map.
*   **Role-Based Access**:
    *   **Admin**: Manage buses, routes, drivers, and view overall statistics.
    *   **Driver**: Start/Stop trips, broadcast live location.
    *   **Passenger**: View live bus locations, estimated arrival times (ETA), and route details.
*   **Interactive Maps**: Integrated **Leaflet Maps** with OpenStreetMap for accurate visualization.
*   **Mobile Optimised**: Responsive design that works great on mobile devices.
## 🛠️ Technology Stack
*   **Frontend**: React.js, Vite, Tailwind CSS, Shadcn UI
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **Real-Time Communication**: Socket.io
*   **Maps**: React Leaflet
## 🏃‍♂️ How to Run Locally
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/fathimnishasyedabuthakir566/BuZzo.git
    cd BuZzo
    ```
2.  **Install Dependencies**
    ```bash
    # Install Frontend Dependencies
    npm install
    # Install Backend Dependencies
    cd backend
    npm install
    cd ..
    ```
3.  **Start the Application**
    You need to run both frontend and backend servers.
    ```bash
    # Run Frontend (in one terminal)
    npm run dev
    # Run Backend (in another terminal)
    cd backend
    npm run dev
    ```
## 📱 Mobile Connection
To test the app on your mobile device (on the same Wi-Fi):
1.  Start the server with the host flag (already configured in this repo):
    ```bash
    npm run dev
    ```
2.  Check the terminal for the **Network URL** (e.g., `http://192.168.1.x:XXXX`).
3.  Open that URL in your mobile browser.
## 👥 Contributors
*   **Fathim Nisha** - *Lead Developer*
