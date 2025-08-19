import mongoose, { Schema, models, model } from "mongoose";

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.Comment || model("Comment", CommentSchema);