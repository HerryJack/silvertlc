// Import All the Packages
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

// Initialize Express App
const app = express();

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
const mongoose = require("./config/mongoose");

// Import Routers
const authRouter = require("./routes/authRouter");
const individualRouter = require("./routes/individualRouter");
const corporateUserRouter = require("./routes/corporateUserRouter");
const messageRouter = require("./routes/messageRouter");

// const userModel = require("./models/userModel");
// const chatroomModel = require("./models/Message/CharRoomModel");
// const jwt = require("jsonwebtoken")
// const io = require("socket.io")(8000, {  // Backend runs on port 8000
//     cors: {
//       origin: "http://localhost:5173",  // Your frontend port
//       methods: ["GET", "POST"],
//     },
//   });

//   const userEmails = {};

//   io.on("connection", (socket) => {
//     // console.log("A user connected:", socket.id);
  
//     socket.on("send_email", async (data) => {
//       const { groupName, token } = data;
//       try {
//         // Decode the token to extract user data
//         const decoded = jwt.verify(token, process.env.JWT_KEY);
//         const sender = await userModel.findOne({
//           name: decoded.name,
//           email: decoded.email,
//           role: decoded.role,
//         });
  
//         if (!sender) {
//           socket.emit("error", { message: "Sender not Found" });
//           return;
//         }
  
//         const group = await chatroomModel.findOne({ groupName });
//         if (!group) {
//           socket.emit("error", { message: "Group not Found" });
//           return;
//         }
        
  
//         if (!group.members.some((member) => member.email === sender.email)) {
//           socket.emit("error", { message: "You are not a member of this group" });
//           return;
//         }
  
//         // Send all messages in the group to the user
//         socket.emit("all_messages", group.groupMessages, sender.email);
  
//         // Store email for the current socket
//         userEmails[socket.id] = sender.email;
//         socket.join(groupName); // User joins the chat room
//       } catch (error) {
//         console.log("Error on Chatting", error);
//         socket.emit("error", { message: "Something went wrong" });
//       }
//     });
  
//     socket.on("send_message", async (groupName, messageData) => {
//       console.log(groupName, messageData)
//       const email = userEmails[socket.id];
//       if (!email) {
//         socket.emit("error", { message: "Unauthorized action" });
//         return;
//       }
  
//       const group = await chatroomModel.findOne({ groupName });
//       if (!group) {
//         socket.emit("error", { message: "Group not Found" });
//         return;
//       }
  
//       const newMessage = {
//         sender: email,
//         isImage: messageData.isImage || false,
//         message: messageData.message,
//         date: new Date(),
//       };
//       group.groupMessages.push(newMessage);
//       await group.save();
  
//       // Emit message to all users in the group
//       io.to(groupName).emit("receive_message", newMessage);
//     });
  
//     socket.on("disconnect", () => {
//       // console.log("User disconnected:", socket.id);
//       delete userEmails[socket.id]; // Clean up on disconnect
//     });
//   });
  

  
  //   // Joining a chat room
  //   socket.on("join_chat", (chatId) => {
  //     console.log(`User ${userEmails[socket.id]} joined chat: ${chatId}`);
  //     socket.join(chatId); // User joins the chat room
  //   });
  
  //   // Sending a message to a specific chat (room)
  //   socket.on("send_message", (chatId, message) => {
  //     const email = userEmails[socket.id]; // Get the email associated with the socket
  //     console.log(`Message received for chat ${chatId} from ${email}:`, message);
  //     io.to(chatId).emit("receive_message", message, email); // Broadcast to all users in the same chat room
  //   });
  
  //   // Disconnecting a user
  //   socket.on("disconnect", () => {
  //     console.log("User disconnected:", socket.id);
  //     delete userEmails[socket.id]; // Clean up on disconnect
  //   });



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
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'  // Use Vercel's temporary storage
}));
app.use(express.json({ limit: '50mb' })); // Increase JSON body limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

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

// Define Port and Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
