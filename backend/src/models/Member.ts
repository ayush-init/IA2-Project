import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  email: string;
  membershipId: string;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
    membershipId: {
      type: String,
      required: [true, 'Membership ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Joined date is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Member: Model<IMember> = mongoose.model<IMember>('Member', MemberSchema);
export default Member;
