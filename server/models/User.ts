import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// インデックス（unique: trueで既に定義されているものは除外）
userSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', userSchema);
