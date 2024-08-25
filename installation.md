Sure! Here's a decorated and polished version of the installation guide:

---

## 🌟 **Whiteboard Setup**

1. **Create Firebase Account & Project**  
   🔹 Sign up for a Firebase account.  
   🔹 Create a new web project and generate the credentials.

2. **Update Firebase Configuration**  
   🔹 Replace the credentials in `/src/Firebase/firebaseconfig.js` with your generated Firebase credentials.

3. **Enable Authentication**  
   🔹 Go to the Firebase console and enable **Google** and **Email Authentication** to allow user logins.

4. **Install Node Packages**  
   🔹 Run `npm i` to install all required packages.

---

## 📧 **Email API Setup**

1. **Install Node Packages**  
   🔹 Navigate to the `backend` folder.  
   🔹 Run `npm i` to install the necessary packages.

2. **Configure Environment Variables**  
   🔹 Replace the environment variables in the `.env` file with your specific values.

3. **Run the API**  
   🔹 This API operates on port **8000**.  
   🔹 Start the server using the command: `yarn dev`.

---

## 🌐 **WebSocket Setup**

1. **Install WebSocket Packages**  
   🔹 Go to the `websocket` folder.  
   🔹 Run `npm i` to install the required packages.

2. **Start the WebSocket Server**  
   🔹 This WebSocket server runs on port **8080**.  
   🔹 Start the server using the command: `node server.js`.

---

## 📦 **Deployment**

There are three separate deployment folders for Docker:

- **whiteboard**
- **websocket**
- **backend**

🔹 Update the WebSocket or API URLs in your project configuration.  
