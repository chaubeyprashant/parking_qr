import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(data) {
    // Handle both MongoDB _id and regular id
    this.id = data.id || data._id?.toString() || uuidv4();
    this.email = data.email?.toLowerCase() || '';
    this.name = data.name || '';
    this.plan = data.plan || 'free';
    this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
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

