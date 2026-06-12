const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

(async () => {
  try {
    await connectDB();

    const matricule = process.argv[2] || 'ADMIN001';
    const newPassword = process.argv[3] || process.env.NEW_ADMIN_PASSWORD || '110197058Elias2_';

    const user = await User.findOne({ matricule });

    if (!user) {
      console.error(`User with matricule ${matricule} not found.`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`Password for ${matricule} updated successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin password:', err);
    process.exit(1);
  }
})();
