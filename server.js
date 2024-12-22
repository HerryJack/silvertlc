const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const http = require("http"); // Required for creating HTTP server
const { Server } = require("socket.io"); // Import Socket.io

// Initialize Express App
const app = express();

// Load Environment Variables
dotenv.config();

// MongoDB Connection
const mongoose = require("./config/mongoose");

// Import Routers
const authRouter = require("./routes/authRouter");
const individualRouter = require("./routes/individualRouter");
const corporateUserRouter = require("./routes/corporateUserRouter");
const messageRouter = require("./routes/messageRouter");

const userModel = require("./models/userModel");
const chatroomModel = require("./models/Message/CharRoomModel");
const jwt = require("jsonwebtoken");

// Middleware Configurations
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp' }));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/individual", individualRouter);
app.use("/api/v1/coporateuser", corporateUserRouter);
app.use("/api/v1/message", messageRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "An internal server error occurred." });
});

// Create HTTP Server for Socket.io
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_FRONTEND_URL, // Update with your frontend's deployed URL
    methods: ["GET", "POST"],
  },
});


// Socket.io Logic
const userEmails = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send_email", async (data) => {
    const { groupName, token } = data;
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const sender = await userModel.findOne({
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      });

      if (!sender) {
        socket.emit("error", { message: "Sender not Found" });
        return;
      }

      const group = await chatroomModel.findOne({ groupName });
      if (!group) {
        socket.emit("error", { message: "Group not Found" });
        return;
      }

      if (!group.members.some((member) => member.email === sender.email)) {
        socket.emit("error", { message: "You are not a member of this group" });
        return;
      }

      socket.emit("all_messages", group.groupMessages, sender.email);
      userEmails[socket.id] = sender.email;
      socket.join(groupName);
    } catch (error) {
      console.log("Error on Chatting", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  socket.on("send_message", async (groupName, messageData) => {
    const email = userEmails[socket.id];
    if (!email) {
      socket.emit("error", { message: "Unauthorized action" });
      return;
    }

    const group = await chatroomModel.findOne({ groupName });
    if (!group) {
      socket.emit("error", { message: "Group not Found" });
      return;
    }

    const newMessage = {
      sender: email,
      isImage: messageData.isImage || false,
      message: messageData.message,
      date: new Date(),
    };
    group.groupMessages.push(newMessage);
    await group.save();

    io.to(groupName).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userEmails[socket.id];
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// // Whitelist your frontend's URL
// const corsOptions = {
//     origin: 'http://example.com', // Frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//     credentials: true, // Allow cookies and credentials
//   };
  
//   app.use(cors(corsOptions));