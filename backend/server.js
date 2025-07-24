const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS and body parser middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// JWT Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Initialize database tables
async function initializeDatabase() {
  try {
    // Enable event scheduler
    await db.query('SET GLOBAL event_scheduler = ON');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(191) NOT NULL,
        role ENUM('admin', 'user', 'operator', 'boss', 'chief') DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email (email(191))
      )
    `);

    // Create pending_signups table
    await db.query(`
      CREATE TABLE IF NOT EXISTS pending_signups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(191) NOT NULL,
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        UNIQUE KEY unique_email (email(191))
      )
    `);

    // Create deleted_users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deleted_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_id INT NOT NULL,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(191) NOT NULL,
        role ENUM('admin', 'user', 'operator', 'boss', 'chief'),
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP,
        deletion_reason TEXT,
        INDEX idx_deleted_at (deleted_at),
        INDEX idx_original_id (original_id)
      )
    `);

    // Drop existing cleanup event if it exists
    await db.query(`DROP EVENT IF EXISTS cleanup_deleted_users`);

    // Create cleanup event
    await db.query(`
      CREATE EVENT cleanup_deleted_users
      ON SCHEDULE EVERY 1 DAY
      STARTS CURRENT_TIMESTAMP
      DO
      BEGIN
        DELETE FROM deleted_users 
        WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
      END
    `);

    // Check if admin user exists
    const [existingAdmins] = await db.query(
      'SELECT id FROM users WHERE email = ? AND role = "admin"',
      ['admin@admin.com']
    );

    // Create admin user if it doesn't exist
    if (existingAdmins.length === 0) {
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.query(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, "admin", "active")',
        ['admin@admin.com', hashedPassword]
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Verify event scheduler is running
    const [eventSchedulerStatus] = await db.query('SELECT @@event_scheduler as status');
    if (eventSchedulerStatus[0].status === 'ON') {
      console.log('Event scheduler is running');
    } else {
      console.error('Failed to enable event scheduler');
    }

    // Verify cleanup event exists
    const [events] = await db.query(`
      SELECT * FROM information_schema.events 
      WHERE event_name = 'cleanup_deleted_users'
    `);
    if (events.length > 0) {
      console.log('Cleanup event created successfully');
    } else {
      console.error('Failed to create cleanup event');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Initialize database on startup
initializeDatabase();

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const [pendingSignups] = await db.query(
      'SELECT id FROM pending_signups WHERE email = ? AND status = "pending"',
      [email]
    );
    if (pendingSignups.length > 0) {
      return res.status(400).json({ message: 'Signup request already pending' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO pending_signups (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(200).json({ message: 'Signup request submitted for approval' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating signup request' });
  }
});

// Get user profile
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT email, role, status FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Admin endpoints
// Get pending signups
app.get('/api/admin/pending-signups', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [pendingSignups] = await db.query(
      'SELECT id, email, request_date FROM pending_signups WHERE status = "pending"'
    );
    res.json(pendingSignups);
  } catch (error) {
    console.error('Get pending signups error:', error);
    res.status(500).json({ message: 'Error fetching pending signups' });
  }
});

// Get rejected accounts
app.get('/api/admin/rejected-accounts', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [rejectedAccounts] = await db.query(
      'SELECT id, email, request_date, status FROM pending_signups WHERE status = "rejected"'
    );
    res.json(rejectedAccounts);
  } catch (error) {
    console.error('Get rejected accounts error:', error);
    res.status(500).json({ message: 'Error fetching rejected accounts' });
  }
});

// Get all users
app.get('/api/admin/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, role, status, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Process signup (approve/reject)
app.post('/api/admin/process-signup', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { signupId, action, role = 'user' } = req.body;

    const [pendingSignups] = await db.query(
      'SELECT * FROM pending_signups WHERE id = ? AND status = "pending"',
      [signupId]
    );
    
    if (pendingSignups.length === 0) {
      return res.status(404).json({ message: 'Signup request not found' });
    }

    const pendingSignup = pendingSignups[0];

    if (action === 'approve') {
      await db.query(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, "active")',
        [pendingSignup.email, pendingSignup.password, role]
      );

      await db.query(
        'UPDATE pending_signups SET status = "approved" WHERE id = ?',
        [signupId]
      );
    } else {
      await db.query(
        'UPDATE pending_signups SET status = "rejected" WHERE id = ?',
        [signupId]
      );
    }

    res.json({ message: `Signup ${action}d successfully` });
  } catch (error) {
    console.error('Process signup error:', error);
    res.status(500).json({ message: 'Error processing signup request' });
  }
});

// Update user
app.post('/api/admin/update-user', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id, status, role } = req.body;

    // Validate input
    if (!id || !status || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing own role/status if admin
    if (existingUsers[0].id === req.user.userId) {
      return res.status(403).json({ message: 'Cannot modify own account' });
    }

    // Update user
    const [result] = await db.query(
      'UPDATE users SET status = ?, role = ? WHERE id = ?',
      [status, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get updated user data
    const [updatedUsers] = await db.query(
      'SELECT id, email, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Reapprove rejected account
app.post('/api/admin/reapprove-account', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id, role } = req.body;

    const [rejectedSignups] = await db.query(
      'SELECT * FROM pending_signups WHERE id = ? AND status = "rejected"',
      [id]
    );

    if (rejectedSignups.length === 0) {
      return res.status(404).json({ message: 'Rejected signup not found' });
    }

    const rejectedSignup = rejectedSignups[0];

    await db.query(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, "active")',
      [rejectedSignup.email, rejectedSignup.password, role]
    );

    await db.query(
      'UPDATE pending_signups SET status = "approved" WHERE id = ?',
      [id]
    );

    res.json({ message: 'Account reapproved successfully' });
  } catch (error) {
    console.error('Reapprove account error:', error);
    res.status(500).json({ message: 'Error reapproving account' });
  }
});

// Change user password (admin only)
app.post('/api/admin/change-user-password', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Validate input
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing own password through this endpoint
    if (existingUsers[0].id === req.user.userId) {
      return res.status(403).json({ message: 'Cannot modify own password through this endpoint' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Delete user (admin only)
app.post('/api/admin/delete-user', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { userId, reason } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userToDelete = existingUsers[0];

    // Don't allow deleting own account
    if (userToDelete.id === req.user.userId) {
      return res.status(403).json({ message: 'Cannot delete own account' });
    }

    // Don't allow deleting other admin accounts
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Move user to deleted_users table
    await db.query(
      'INSERT INTO deleted_users (original_id, email, password, role, created_at, deletion_reason) VALUES (?, ?, ?, ?, ?, ?)',
      [userToDelete.id, userToDelete.email, userToDelete.password, userToDelete.role, userToDelete.created_at, reason || null]
    );

    // Delete user from users table
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get deleted users (admin only)
app.get('/api/admin/deleted-users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [deletedUsers] = await db.query(
      'SELECT id, original_id, email, role, deleted_at, created_at, deletion_reason FROM deleted_users ORDER BY deleted_at DESC'
    );

    // Calculate days until deletion for each user
    const usersWithDaysLeft = deletedUsers.map(user => {
      const deleteDate = new Date(user.deleted_at);
      const thirtyDaysLater = new Date(deleteDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const now = new Date();
      const daysLeft = Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...user,
        days_until_deletion: Math.max(0, daysLeft)
      };
    });

    res.json(usersWithDaysLeft);
  } catch (error) {
    console.error('Get deleted users error:', error);
    res.status(500).json({ message: 'Error fetching deleted users' });
  }
});

// Restore deleted user (admin only)
app.post('/api/admin/restore-user', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { originalId } = req.body;

    // Get deleted user info
    const [deletedUsers] = await db.query(
      'SELECT * FROM deleted_users WHERE original_id = ?',
      [originalId]
    );

    if (deletedUsers.length === 0) {
      return res.status(404).json({ message: 'Deleted user not found' });
    }

    const deletedUser = deletedUsers[0];

    // Check if email is already taken by another user
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [deletedUser.email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    // Restore user to users table
    await db.query(
      'INSERT INTO users (id, email, password, role, status, created_at) VALUES (?, ?, ?, ?, "active", ?)',
      [deletedUser.original_id, deletedUser.email, deletedUser.password, deletedUser.role, deletedUser.created_at]
    );

    // Remove from deleted_users table
    await db.query('DELETE FROM deleted_users WHERE original_id = ?', [originalId]);

    res.json({ message: 'User restored successfully' });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({ message: 'Error restoring user' });
  }
});

// Manual cleanup of deleted users (admin only)
app.post('/api/admin/cleanup-deleted-users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM deleted_users WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    res.json({ 
      message: 'Cleanup completed successfully',
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ message: 'Error during cleanup' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 