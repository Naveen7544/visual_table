const { Worker } = require("worker_threads");
const path = require("path");
const controller = require("../controller/table-controller");

exports.uploadXlsx = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = path.join(__dirname, "../../uploads", req.file.filename);

    // Correct worker path pointing to the worker.js file
    const workerPath = path.join(__dirname, controller); // Adjust this path to where your worker.js is located

    // Create a new Worker thread
    const worker = new Worker(workerPath);

    // Post the file path to the worker thread for processing
    worker.postMessage(filePath);

    // Respond immediately to the user
    res.status(200).json({
      message:
        "File is being processed in the background. You will be notified once the data is inserted.",
      fileName: req.file.filename,
    });

    // Handle the result from the worker thread
    worker.on("message", (message) => {
      if (message.status === "success") {
        console.log(
          `Data successfully inserted. Total rows: ${message.totalInserted}`
        );
      } else {
        console.error("Error in worker thread:", message.message);
      }
    });

    // Handle any errors in the worker thread
    worker.on("error", (error) => {
      console.error("Worker thread error:", error);
    });

    // Handle the exit event of the worker thread
    worker.on("exit", (exitCode) => {
      if (exitCode !== 0) {
        console.error(`Worker stopped with exit code ${exitCode}`);
      }
    });
  } catch (error) {
    console.error("Error in uploadXlsx:", error);
    res.status(500).json({ message: "Error processing file.", error });
  }
};
