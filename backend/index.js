// importing modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
// const { Server } = require("socket.io");

// data parsing
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// connecting to database
const connectDB = async () => {
  await mongoose.connect(process.env.DB_URL);
};
connectDB()
  .then(() => {
    console.log("Successfully connected to Mongo DB");
  })
  .catch((err) => {
    console.log("Mongo DB Connection failed.", err.message);
  });

// importing routes
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const zegoTokenRoutes = require("./routes/zegoToken.routes");

app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api", zegoTokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Occurred" } = err;
  res.status(status).send(message);
  console.log(err.stack);
});

// Listening to Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("server is listening on " + port);
});

// Web sockets connection using socket.io
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

let onLineUsers = {};

io.on("connection", (socket) => {
  console.log("user conneccted to socket.io", socket.id);

  socket.on("add_online_user", (userId) => {
    onLineUsers[userId] = userId;
  });

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(onLineUsers);
    socket.emit("online_users", onLineUsers);
    console.log("User joined room : " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("outgoing_voice_call", (data) => {
    console.log(data);
    socket.to(data.to).emit("incoming_voice_call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("outgoing_video_call", (data) => {
    console.log(data);
    socket.to(data.to).emit("incoming_video_call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("reject_voice_call", (data) => {
    socket.to(data.to).emit("voice_call_rejected");
  });

  socket.on("reject_video_call", (data) => {
    socket.to(data.to).emit("video_call_rejected");
  });

  socket.on("accept_incoming_call", (data) => {
    socket.to(data.to).emit("accept_call");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    console.log(socket.id);
  });

  // socket.off("setup", () => {
  //   console.log("user disconnected");
  //   socket.leave(userData._id);
  // });
});
