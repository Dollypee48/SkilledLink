const User = require("../models/User");
const ArtisanProfile = require("../models/ArtisanProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROLES = ["customer", "artisan", "admin"];

// Helper: Generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, nationality, state, address, occupation } = req.body;

    // Basic validation
    if (!name || !email || !password || !phone || !nationality || !state || !address) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be customer, artisan, or admin" });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      nationality,
      state,
      address,
      occupation,
      kycVerified: role === "customer", // auto verify customers
    });

    // If artisan, create profile
    if (role === "artisan") {
      const profile = await ArtisanProfile.create({ userId: user._id });
      user.artisanProfile = profile._id;
      await user.save();
    }

    // Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "Registration successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nationality: user.nationality,
        state: user.state,
        address: user.address,
        occupation: user.occupation,
        kycVerified: user.kycVerified,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ message: "Invalid email or role" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    // Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nationality: user.nationality,
        state: user.state,
        address: user.address,
        occupation: user.occupation,
        kycVerified: user.kycVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: payload.id, refreshToken });
    if (!user) return res.status(401).json({ message: "Invalid or expired refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user); // issue new access and refresh tokens
    user.refreshToken = newRefreshToken; // Update refresh token in DB
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken }); // Send back new refresh token
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
