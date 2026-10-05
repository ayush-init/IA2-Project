import mongoose, { Document, Schema, Model } from 'mongoose';

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface IBorrowRecord extends Document {
  book: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowRecordSchema = new Schema<IBorrowRecord>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Issue date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (this: any, val: Date): boolean {
          if (!val) return false;
          const issue = this.issueDate || new Date();
          return new Date(val).getTime() >= new Date(issue).getTime();
        },
        message: 'Due date cannot be before issue date',
      },
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: '{VALUE} is not a valid borrow status',
      },
      default: 'issued',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes to speed up queries
BorrowRecordSchema.index({ member: 1, status: 1 });
BorrowRecordSchema.index({ book: 1, status: 1 });
BorrowRecordSchema.index({ dueDate: 1 });
BorrowRecordSchema.index({ status: 1 });

export const BorrowRecord: Model<IBorrowRecord> = mongoose.model<IBorrowRecord>(
  'BorrowRecord',
  BorrowRecordSchema
);
export default BorrowRecord;
