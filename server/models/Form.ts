import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionOption {
  id: string;
  label: string;
  value: string;
  limit?: number;
}

export interface IQuestionValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface IQuestionSettings {
  placeholder?: string;
  defaultValue?: string | number | boolean;
  multiple?: boolean;
  rows?: number;
  scale?: number;
}

export interface IQuestion {
  id: string;
  type:
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'datetime'
    | 'file'
    | 'rating'
    | 'scale'
    | 'yesno';
  label: string;
  description?: string;
  required: boolean;
  isPersonalInfo: boolean;
  options?: IQuestionOption[];
  validation?: IQuestionValidation;
  settings?: IQuestionSettings;
}

export interface IFormSettings {
  allowAnonymous: boolean;
  requireLogin: boolean;
  maxSubmissions?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface IForm extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  settings: IFormSettings;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionOptionSchema = new Schema<IQuestionOption>(
  {
    id: String,
    label: String,
    value: String,
    limit: Number,
  },
  { _id: false }
);

const questionValidationSchema = new Schema<IQuestionValidation>(
  {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
    customMessage: String,
  },
  { _id: false }
);

const questionSettingsSchema = new Schema<IQuestionSettings>(
  {
    placeholder: String,
    defaultValue: Schema.Types.Mixed,
    multiple: Boolean,
    rows: Number,
    scale: Number,
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    id: String,
    type: {
      type: String,
      enum: [
        'text',
        'textarea',
        'email',
        'phone',
        'number',
        'select',
        'radio',
        'checkbox',
        'date',
        'time',
        'datetime',
        'file',
        'rating',
        'scale',
        'yesno',
      ],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: String,
    required: {
      type: Boolean,
      default: false,
    },
    isPersonalInfo: {
      type: Boolean,
      default: false,
    },
    options: [questionOptionSchema],
    validation: questionValidationSchema,
    settings: questionSettingsSchema,
  },
  { _id: false }
);

const formSettingsSchema = new Schema<IFormSettings>(
  {
    allowAnonymous: {
      type: Boolean,
      default: false,
    },
    requireLogin: {
      type: Boolean,
      default: true,
    },
    maxSubmissions: Number,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (questions: IQuestion[]) {
          return questions.length > 0;
        },
        message: 'At least one question is required',
      },
    },
    settings: {
      type: formSettingsSchema,
      default: () => ({}),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// インデックス
formSchema.index({ createdBy: 1 });
formSchema.index({ 'settings.isActive': 1 });
formSchema.index({ createdAt: -1 });

// 仮想フィールド
formSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'formId',
  count: true,
});

export default mongoose.model<IForm>('Form', formSchema);
