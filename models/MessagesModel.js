import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",  // Reference to the Users collection
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",  // Reference to the Users collection
    required: false,  // Recipient can be optional (e.g., in group chats)
  },
  messageType: {
    type: String,
    enum: ["text", "file"],  // Restrict message type to either 'text' or 'file'
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";  // Required if the message type is 'text'
    },
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file";  // Required if the message type is 'file'
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,  // Automatically set the timestamp to current date when a new message is created
  }
});

const Message = mongoose.model("Messages",messageSchema)
export default Message