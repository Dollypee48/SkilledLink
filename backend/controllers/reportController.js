const Report = require("../models/Report");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { category, description } = req.body;
    const file = req.file?.filename || null;

    if (!category || !description) {
      return res.status(400).json({ message: "Category and description are required" });
    }

    const report = new Report({
      userId: req.user.id,
      category,
      description,
      file,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reports for the logged-in user
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a report by ID
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
