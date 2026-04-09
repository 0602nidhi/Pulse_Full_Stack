const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // To simulate SaaS multi-tenancy, if admin registers, create a new Tenant/organization
  // If a viewer/editor registers, put them in a default organization, or assign based on some logic.
  // For the sake of this assignment, we'll give them all a shared organization 'org1' or generate a unique one for admins.
  const orgId = new mongoose.Types.ObjectId('000000000000000000000001');

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Viewer', // Default to viewer
    organizationId: orgId
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

module.exports = {
  authUser,
  registerUser,
};
