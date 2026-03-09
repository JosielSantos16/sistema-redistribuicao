import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      minlength: 11,
      maxlength: 11,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    data_nascimento: {
      type: Date,
      required: true,
    },
    password_hash: {
      type: String,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    registration_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", UserSchema);
