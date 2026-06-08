import 'dotenv/config';
import { User } from './src/models/index.js';

async function makeAdmin() {
    try {
        const user = await User.findOne({ where: { email: 'admin@example.com' } });
        if (user) {
            await user.update({ role: 'admin' });
            console.log('✅ User updated to admin role:', user.email);
        } else {
            console.log('❌ User not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

makeAdmin();
