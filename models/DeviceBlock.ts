import mongoose from "mongoose";

const DeviceBlockSchema = new mongoose.Schema(
  {
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    club: {
      type: String,
      required: true,
    },
    blockedUntil: {
      type: Date,
      required: true,
    },
    userId: {
      type: String,
      required: false,
      index: true,
    },
    username: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

DeviceBlockSchema.index({ blockedUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.DeviceBlock ||
  mongoose.model("DeviceBlock", DeviceBlockSchema);
