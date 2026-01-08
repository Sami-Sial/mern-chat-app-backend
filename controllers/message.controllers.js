const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const ExpressError = require("../utils/ExpressError");
const cloudinary = require("cloudinary").v2;

const allMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    return next(new ExpressError(400, error.message));
  }
};

const sendMessage = async (req, res, next) => {
  const { content = null, chatId } = req.body;

  console.log(req.file);

  if (!chatId) {
    return next(new ExpressError(400, "Invalid data passed"));
  }

  let newMessage = {};

  if (req.file) {
    const mime = req.file.mimetype;

    if (mime.startsWith("image/")) {
      newMessage.msgType = "Image";
      newMessage.content = req.file.path;
    } else if (mime.startsWith("video/")) {
      newMessage.msgType = "Video";
      newMessage.content = req.file.path;
    } else if (mime.startsWith("audio/")) {
      newMessage.msgType = "Audio";
      newMessage.content = req.file.path;
    } else if (mime === "application/pdf") {
      newMessage.msgType = "PDF";
      newMessage.content = req.file.path;
    } else if (
      mime === "application/zip" ||
      mime === "application/x-zip-compressed"
    ) {
      newMessage.msgType = "ZIP";
      newMessage.content = req.file.path;
    } else if (mime === "text/plain") {
      newMessage.msgType = "TextFile";
      newMessage.content = req.file.path;
    } else if (mime.startsWith("application/")) {
      // For Word, Excel, PowerPoint, etc.
      newMessage.msgType = "Document";
      newMessage.content = req.file.path;
    } else {
      return next(new ExpressError(400, "Unsupported file type"));
    }

    // ✅ Common properties for messages with files
    newMessage.chat = chatId;
    newMessage.sender = req.user._id;
  } else {
    // ✅ For plain text messages
    newMessage.sender = req.user._id;
    newMessage.content = content;
    newMessage.chat = chatId;
  }

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMsg: message });

    res.json(message);
  } catch (error) {
    return next(new ExpressError(400, error.message));
  }
};

module.exports = { allMessages, sendMessage };
