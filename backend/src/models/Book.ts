import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies count is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: function (this: any, val: number): boolean {
          // If totalCopies is defined, availableCopies must not exceed totalCopies
          if (this.totalCopies !== undefined) {
            return val <= this.totalCopies;
          }
          return true;
        },
        message: 'Available copies ({VALUE}) cannot exceed total copies',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
BookSchema.index({ genre: 1 });
BookSchema.index({ title: 'text', author: 'text' });

export const Book: Model<IBook> = mongoose.model<IBook>('Book', BookSchema);
export default Book;
