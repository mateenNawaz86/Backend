import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videosSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // cloundinery URL
      required: true,
    },

    thumbnail: {
      type: String, // cloundinery URL
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
    },
  },
  { timestamps: true }
);

videosSchema.plugin(mongooseAggregatePaginate);

export const Videos = mongoose.model("Videos", videosSchema);
