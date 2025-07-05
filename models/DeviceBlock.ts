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
    blockedBy: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "Blocked by admin",
    },
  },
  {
    timestamps: true,
  }
);

DeviceBlockSchema.index({ blockedUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.DeviceBlock ||
  mongoose.model("DeviceBlock", DeviceBlockSchema);
