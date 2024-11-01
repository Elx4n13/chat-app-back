import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
const setupSocket = (server) => {
  const allowedOrigins = ["http://localhost:5173", "https://chat-app-client-zeta-umber.vercel.app"];
  const io = new SocketIoServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const userSocketMap = new Map();
  const disconnect = (socket) => {
    const userId = socket.handshake.query.userId;
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    userSocketMap.delete(userId);
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);
    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");
    if(recipientSocketId ){
        io.to(recipientSocketId).emit("recieveMessage", messageData);

    }
    if(senderSocketId){
        io.to(senderSocketId).emit("recieveMessage", messageData);
    }
    };
    const sendMessageToChannel = async (message) => {
      const { sender, messageType, content,channelId,fileUrl } = message;
      const createdMessage = await Message.create({
        sender,
        recipient: null,
        timestamp: new Date(),
        messageType,
        content,
        channelId,
        fileUrl,
      })
      const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").exec();

      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      })

      const channel = await Channel.findById(channelId).populate("members");
      const finalData = {...messageData._doc,channelId:channel._id}
      if(channel && channel.members){
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("recieve-channel-message", finalData);
          }
        })
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("recieve-channel-message", finalData);
        }
      }
    }
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    } else {
      console.log("User connected without userId");
    }
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendMessageToChannel);
    socket.on("disconnect", () => disconnect(socket));
  });
};
export default setupSocket;
