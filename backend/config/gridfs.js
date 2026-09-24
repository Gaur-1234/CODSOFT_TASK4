const mongoose = require("mongoose");

let gridFSBucket = null;

const getGridFSBucket = () => {
  if (gridFSBucket) {
    return gridFSBucket;
  }

  if (
    mongoose.connection.readyState !== 1 ||
    !mongoose.connection.db
  ) {
    throw new Error("MongoDB connection is not ready");
  }

  gridFSBucket = new mongoose.mongo.GridFSBucket(
    mongoose.connection.db,
    {
      bucketName: "resumes",
    }
  );

  return gridFSBucket;
};

module.exports = getGridFSBucket;