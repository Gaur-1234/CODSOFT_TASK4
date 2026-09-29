const mongoose = require("mongoose");
const getGridFSBucket = require("../config/gridfs");

const getMedia = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        message: "Invalid file ID",
      });
    }

    const bucket = getGridFSBucket();

    const fileIdObject = new mongoose.Types.ObjectId(fileId);

    // Find file information
    const files = await mongoose.connection.db
      .collection("resumes.files")
      .find({
        _id: fileIdObject,
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    const file = files[0];

    // Content type
    res.set(
      "Content-Type",
      file.contentType ||
        file.metadata?.contentType ||
        "image/jpeg"
    );

    // Allow browser to display the image
    res.set(
      "Cache-Control",
      "public, max-age=31536000"
    );

    const downloadStream =
      bucket.openDownloadStream(fileIdObject);

    downloadStream.on("error", (error) => {
      console.error(
        "GridFS image stream error:",
        error
      );

      if (!res.headersSent) {
        res.status(404).json({
          message: "Image not found",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Get media error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error",
      });
    }
  }
};

module.exports = {
  getMedia,
};