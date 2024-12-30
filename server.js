// Import All the Packages
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

// Connect to MongoDB
const mongoose = require("./config/mongoose");

// Import Routers
const authRouter = require("./routes/authRouter");
const individualRouter = require("./routes/individualRouter");
const serviceProviderRouter = require("./routes/serviceProviderRouter");
const messageRouter = require("./routes/messageRouter");
const alluserRouter = require("./routes/alluserRouter");

// 
const userModel = require("./models/Role/userModel");
const chatroomModel = require("./models/Message/CharRoomModel");
const jwt = require("jsonwebtoken");

// // Whitelist your frontend's URL
// const corsOptions = {
//     origin: 'http://example.com', // Frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//     credentials: true, // Allow cookies and credentials
//   };
  
//   app.use(cors(corsOptions));
// Middleware Configurations
app.use(cors()); // Enable CORS for frontend connection
app.use(cookieParser());

// File Upload Middleware
app.use(fileUpload({useTempFiles: true, tempFileDir: '/tmp'}));
app.use(express.json({ limit: '50mb' })); // Increase JSON body limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/individual", individualRouter);
app.use("/api/v1/serviceprovider", serviceProviderRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/alluser", alluserRouter);

// Create HTTP Server for Socket.io
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_FRONTEND_URL, // Update with your frontend's deployed URL
    methods: ["GET", "POST"],
  },
});


app.post("/tt", (req,res)=>{
  console.log(req.body);
  res.status(200).send({message: "Nice"})
})

const addMessage = async (groupName, senderEmail, messageData, socket) => {

  if (!senderEmail) {
    socket.emit("error", { message: "Unauthorized action" });
    return;
  }

  const group = await chatroomModel.findOne({ groupName });
  if (!group) {
    socket.emit("error", { message: "Group not Found" });
    return;
  }

  const newMessage = {
    sender: senderEmail,
    isImage: messageData.isImage || false,
    message: messageData.message,
    date: new Date(),
  };
  group.groupMessages.push(newMessage);

  // Update unread counts for other members
  group.members = group.members.map(member => {
    if (member.email !== senderEmail) {
        member.unreadCount += 1;
    }
    return member;
});

  await group.save();
  return newMessage;
};

const markAsRead = async (groupName, userEmail, socket) => {

  const group = await chatroomModel.findOne({ groupName });
  if (!group) {
    socket.emit("error", { message: "Group not Found" });
    return;
  }

  // Reset unread count for this user
  group.members = group.members.map(member => {
      if (member.email === userEmail) {
          member.unreadCount = 0;
      }
      return member;
  });

  await group.save();
};


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

  socket.on("markasread", async(data)=>{
    console.log(data)
    await markAsRead(data.groupName, data.email, socket)
  })

  socket.on("send_message", async (data) => {
    const groupName = data.groupName;
    const messageData = data.message;
    const email = userEmails[socket.id];
    const newMessage = await addMessage(groupName, email, messageData, socket);
    console.log(newMessage)
    io.to(groupName).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userEmails[socket.id];
  });
});



// Define Port and Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
