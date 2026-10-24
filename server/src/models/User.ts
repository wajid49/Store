import { Schema, model } from 'mongoose';

export type Role = 'customer' | 'admin';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
