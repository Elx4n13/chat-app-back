import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactcRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
const databaseURL = process.env.MONGO_URI;
const allowedOrigins = ["http://localhost:5173", "https://chat-app-client-zeta-umber.vercel.app","https://chat-app-seven-lake-22.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);


app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactcRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channels", channelRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
setupSocket(server);
mongoose
  .connect(databaseURL)
  .then(() => console.log(`Connected to DB on port ${port}`))
  .catch((err) => console.log(err.message));
