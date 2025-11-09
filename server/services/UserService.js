import { db } from '../database/index.js';
import { User } from '../models/User.js';
import { NotFoundError } from '../utils/errors.js';
import { config } from '../config/index.js';

export class UserService {
  async getOrCreateUser(email, name) {
    let user = db.findUserByEmail(email);
    
    if (!user) {
      const newUser = new User({ email, name });
      user = db.createUser(newUser.toJSON());
    }
    
    return new User(user);
  }

  async getUserByEmail(email) {
    const user = db.findUserByEmail(email);
    if (!user) {
      return null;
    }
    return new User(user);
  }

  async getUserInfo(email) {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return {
        exists: false,
        qrCount: 0,
        plan: 'free'
      };
    }

    const qrCount = db.getUserQRCount(user.id);
    
    return {
      exists: true,
      email: user.email,
      name: user.name,
      plan: user.plan,
      qrCount
    };
  }

  async upgradeToPremium(email) {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      throw new NotFoundError('User');
    }

    const updated = db.updateUser(email, { plan: 'premium' });
    
    if (!updated) {
      throw new NotFoundError('User');
    }

    return new User(updated);
  }

  canGenerateQR(user, qrCount) {
    const limit = user.isPremium() 
      ? config.limits.premium.qrCodes 
      : config.limits.free.qrCodes;

    return {
      allowed: qrCount < limit,
      limit,
      current: qrCount
    };
  }
}

