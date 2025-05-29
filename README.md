# Chatgram (Real-time chat Application)

**Chatgram** is a modern, real-time chat application built using Firebase, featuring:

- 📱 **Emoji chatting**
- 📸 **Photo video and audio sharing**
- 👥 **Group creation and messaging**
- 🧠 **AI-powered chat summarizer and assistant**
- 🔥 **Real-time communication with Firebase Firestore & Realtime Database**

---

## 🔧 Tech Stack

- **Frontend:** React.js, TailwindCSS
- **Backend/Serverless:** Firebase Functions (Optional for AI assistant), Node.js
- **Database:** Firebase Firestore + Realtime Database
- **Authentication:** Firebase Auth (Google Sign-In or email/password)
- **AI Integration:** OpenAI or custom summarization models (for summarizer and assistant)
- **Media Storage:** Cloudinary

---

## ✨ Features

### ✅ Core Features
- 🔒 User authentication (Google sign-in)
- 💬 One-to-one and group chat support
- 😀 Emoji picker and messaging
- 📷 Share photos and videos in chat with in built audio recording
- 📝 Real-time message updates using Firestore and Realtime Database with real time status update (Online | Offline | Typing | Last seen)

### 🧠 AI-Powered Features
- 🧾 **Chat Summarizer** – Get summaries of long conversations
- 🤖 **AI Assistant** – Ask questions and receive smart replies inside your chat

---

## 📸 Screenshots

### Start Page

![start](https://github.com/user-attachments/assets/87ba9d11-41b4-4af6-a7e3-d3ec14a26f1d)

### Profile Setup Page

![profile](https://github.com/user-attachments/assets/491e2a3a-5c6c-41d4-9fb7-ef26526fcd12)

### Chat Page

![image](https://github.com/user-attachments/assets/d705a6d4-9cac-42f6-9978-fbb479de94d3)


---

## 🚀 Project Setup: Firebase + Cloudinary

This guide will help you set up Firebase and Cloudinary for this project. The project uses:

- **Firebase** – for authentication, real-time database, Firestore, and storage.
- **Cloudinary** – for optimized image/video uploads and delivery.
-  Attached a sample .env file for your reference

### 🔥 Firebase Setup

1. Create a Firebase Project
  - Visit [Firebase Console](https://console.firebase.google.com/).
  - Click **Add project** → Enter project name → Continue with default settings.

2. Register Your Web App
  - In your Firebase dashboard, go to **Project Overview > Web** (`</>` icon).
  - Register the app and copy the Firebase configuration snippet.

3. Enable Authentication
  - Go to **Authentication > Sign-in method**.
  - Enable **Google Sign-In** or other desired providers.
  - Add your app's domain under **Authorized domains** (e.g., `localhost`, `yourdomain.com`).

4. Enable Firestore or Realtime Database
  - Go to **Firestore Database** or **Realtime Database**.
  - Click **Create database** → Start in **test mode** (for development).

### ☁️ Cloudinary Setup

1. Create an Account
  - Visit [Cloudinary](https://cloudinary.com/) and sign up for a free account.

2. Get API Credentials
  - After logging in, go to **Dashboard**.
  - Copy the following credentials:
    - **Cloud name**
    - **API Key**
    - **API Secret**

### 🤖 AI Setup 

  Generate **API Key** from GeminiAI


---


## Installation

```bash
# Clone repository
git clone https://github.com/suveerprasad/chatgram.git

# Install dependencies
cd app
npm install

#Run the Project
cd app
npm run dev
```

---

## 🌐 Live Demo
Experience Chatgram at [https://chatgram-kappa.vercel.app](https://chatgram-kappa.vercel.app)

## 👥 Contributors
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/simpledee1701">
        <img src="https://avatars.githubusercontent.com/u/174812664?v=4" width="100px;" alt="John Doe" style="border-radius:50%;"/><br />
        <sub><b>Deepak V</b></sub>
      </a><br />
      <a href="https://www.linkedin.com/in/deepak-v-4254301b2/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" />
      </a>
      <br />
      <sub></sub>
    </td>
    <td align="center">
      <a href="https://github.com/suveerprasad">
        <img src="https://avatars.githubusercontent.com/u/150579516?v=4" width="100px;" alt="Sarah Williams" style="border-radius:50%;"/><br />
        <sub><b>Sai Suveer</b></sub>
      </a><br />
      <a href="https://www.linkedin.com/in/sai-suveer-96a65a1b8/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" />
      </a>
      <br />
      <sub></sub>
    </td>
  </tr>
</table>

