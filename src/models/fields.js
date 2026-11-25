import { Schema } from 'mongoose';

export const ref = (model, options = {}) => ({ type: Schema.Types.ObjectId, ref: model, required: true, ...options });

export const text = (maxlength, options = {}) => ({ type: String, trim: true, maxlength, ...options });

const isUrl = (value) => !value || /^https?:\/\/\S+$/i.test(value);

export const url = {
  type: String,
  maxlength: 2000,
  validate: { validator: isUrl, message: 'harus berupa URL http atau https' },
};

export const urlList = {
  type: [url],
  validate: {
    validator: (list) => Array.isArray(list) && list.length <= 8 && list.every(Boolean),
    message: 'harus berupa daftar maksimal 8 URL',
  },
};
