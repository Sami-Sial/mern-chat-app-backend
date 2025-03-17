const ExpressError = require("../utils/ExpressError");
const { generateToken04 } = require("../utils/generateZegocloudToken");

const generateZegoToken = async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGOCLOUD_APP_ID);
    const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";

    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      res.status(200).json({ token });
    }

    return next(
      new ExpressError(400, "User Id, App Id and Server Secret are required")
    );
  } catch (error) {
    return next(new ExpressError(500, "Some error occurred"));
  }
};

module.exports = { generateZegoToken };
