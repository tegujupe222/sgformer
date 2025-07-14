import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionId: string;
  value: string | string[] | number | boolean | Date;
}

export interface ISubmissionMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  answers: IAnswer[];
  submittedAt: Date;
  attended: boolean;
  metadata?: ISubmissionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const submissionMetadataSchema = new Schema<ISubmissionMetadata>(
  {
    ipAddress: String,
    userAgent: String,
    referrer: String,
  },
  { _id: false }
);

const submissionSchema = new Schema<ISubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    answers: {
      type: [answerSchema],
      required: true,
      validate: {
        validator: function (answers: IAnswer[]) {
          return answers.length > 0;
        },
        message: 'At least one answer is required',
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    metadata: submissionMetadataSchema,
  },
  {
    timestamps: true,
  }
);

// インデックス
submissionSchema.index({ formId: 1 });
submissionSchema.index({ userId: 1 });
submissionSchema.index({ userEmail: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ attended: 1 });

// 複合インデックス
submissionSchema.index({ formId: 1, submittedAt: -1 });
submissionSchema.index({ formId: 1, attended: 1 });

// バリデーション
submissionSchema.pre('save', function (next) {
  // メールアドレスの形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.userEmail)) {
    return next(new Error('Invalid email format'));
  }
  next();
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);
