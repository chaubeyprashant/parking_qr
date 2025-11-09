import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email.toLowerCase();
    this.name = data.name;
    this.plan = data.plan || 'free';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      plan: this.plan,
      createdAt: this.createdAt
    };
  }

  isPremium() {
    return this.plan === 'premium';
  }
}

