import jwt from "jsonwebtoken";
export const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true, // ✅ critical: Render uses HTTPS
    sameSite: "None", // ✅ cross-origin cookie sharing
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
