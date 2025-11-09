import { UserService } from '../services/UserService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getUserInfo = async (req, res, next) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }

      const userInfo = await this.userService.getUserInfo(email);
      sendSuccess(res, userInfo, 'User info retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  upgradeToPremium = async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await this.userService.upgradeToPremium(email);
      
      sendSuccess(res, {
        email: user.email,
        plan: user.plan
      }, 'Upgraded to premium successfully');
    } catch (error) {
      next(error);
    }
  };
}

