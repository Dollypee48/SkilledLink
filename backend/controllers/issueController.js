const Issue = require("../models/Issue");
const User = require("../models/User");

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    const reporter = req.user.id;

    // Validate required fields
    if (!title || !description || !priority || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, priority, and category"
      });
    }

    // Create new issue
    const issue = new Issue({
      title,
      description,
      priority,
      category,
      reporter,
      file: req.file ? req.file.path : null
    });

    await issue.save();

    // Populate reporter details
    await issue.populate('reporter', 'name email');

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });

  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get issues reported by the authenticated user
// @route   GET /api/issues/me
// @access  Private
const getIssuesByReporter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const issues = await Issue.find({ reporter: userId })
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });

  } catch (error) {
    console.error("Error fetching user issues:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status: open, in-progress, resolved, or closed"
      });
    }

    // Find issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Check if user is authorized (reporter or admin)
    if (issue.reporter.toString() !== userId) {
      // You might want to add admin check here later
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this issue"
      });
    }

    // Update status
    issue.status = status;
    
    // If resolving or closing, set resolvedAt timestamp
    if (status === 'resolved' || status === 'closed') {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Populate the updated issue
    await issue.populate('reporter', 'name email');
    await issue.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: issue
    });

  } catch (error) {
    console.error("Error updating issue status:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createIssue,
  getIssuesByReporter,
  updateIssueStatus
};