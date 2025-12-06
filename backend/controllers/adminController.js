const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createFirstAdmin = async (req, res) => {
  try {
    // check if any admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'First admin created successfully',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createFirstAdmin };
