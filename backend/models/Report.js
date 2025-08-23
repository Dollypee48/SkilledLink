const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String }, // uploaded file path
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
});

module.exports = mongoose.model("Report", reportSchema);
