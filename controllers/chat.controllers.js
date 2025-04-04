const chats = require("../data");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMsg");

  isChat = await User.populate(isChat, {
    path: "latestMessage",
    selcet: "name, pic, email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = new Chat(chatData);
      await createdChat.save();
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
};

// const fetchChats = (req, res) => {
//    try {
//      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
//         .populate("users", "-password")
//         .populate("groupAdmin", "password")
//         .populate("latestMsg")
//         .sort({ updatedAt: -1 })
//         .then(async (results) => {
//             results = await User.populate(results, {
//                 path: "latestMessage.sender",
//                 select: "name pic email",
//             })
//             res.status(200).send(results);
//     })
//     } catch (error) {
//        res.status(400).send(error.message);
//     }
// }

const fetchChats = async (req, res) => {
  req.query.searchKeyword;
  try {
    const results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "password")
      .populate("latestMsg")
      .sort({ updatedAt: -1 });

    res.status(200).send(results);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please fill all the fields" });
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user);

  try {
    const groupChatData = new Chat({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const groupChat = await groupChatData.save();
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400).sned("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
};

const addToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(400).sned("Chat Not Found");
  } else {
    res.json(added);
  }
};

const removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(400).send("Chat Not Found");
  } else {
    res.json(removed);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
