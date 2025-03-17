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
    if (req.file.mimetype == ("image/jpeg" || "image/png" || "image/jpg")) {
      newMessage.msgType = "image";
      newMessage.content = req.file.path;
    } else if (
      req.file.mimetype == ("video/mp4" || "video/webm" || "video/mkv")
    ) {
      newMessage.msgType = "video";
      newMessage.content = req.file.path;
    } else if (
      req.file.mimetype ==
      ("audio/mpeg" || "audio/ogg" || "audio/wav" || "audio/mp3")
    ) {
      newMessage.msgType = "audio";
      newMessage.content = req.file.path;
    } else {
      return next(new ExpressError(400, "This file type not supported"));
    }

    newMessage.chat = chatId;
    newMessage.sender = req.user._id;
  } else {
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
