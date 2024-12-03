// const { parentPort } = require("worker_threads");
const { Worker, isMainThread, parentPort } = require("worker_threads");
const xlsx = require("xlsx");
const insertData = require("../model/table-model");
const path = require("path");


const convertExcelDate = (excelDate) => {
  if (typeof excelDate === "number") {
    const startDate = new Date(1900, 0, 1);
    startDate.setDate(startDate.getDate() + excelDate - 2);
    return startDate;
  }
  return excelDate;
};


const formatDate = (date) =>
  date instanceof Date && !isNaN(date)
    ? date.toISOString().split("T")[0]
    : null;


const processFileData = async (formattedData, batchSize = 1000) => {
  const totalBatches = Math.ceil(formattedData.length / batchSize);
  const maxConcurrentBatches = 5; // Adjust concurrency limit
  let totalInserted = 0;

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex += maxConcurrentBatches) {
    const batchPromises = [];
    for (let i = 0; i < maxConcurrentBatches; i++) {
      const batchStartIndex = batchIndex * batchSize + i * batchSize;
      if (batchStartIndex < formattedData.length) {
        const batch = formattedData.slice(batchStartIndex, batchStartIndex + batchSize);
        batchPromises.push(
          insertData.insertData(batch)
            .then((result) => result.affectedRows)
            .catch((err) => {
              console.error(`Batch ${batchIndex + i + 1} failed`, err);
              return 0;
            })
        );
      }
    }

    const results = await Promise.all(batchPromises);
    totalInserted += results.reduce((sum, count) => sum + count, 0);
  }

  return totalInserted;
};

exports.uploadXlsx = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    const headerRow = jsonData[10];
    const dataRows = jsonData.slice(11);
    const cleanedData = dataRows.map((row) => {
      const cleanedRow = {};
      headerRow.forEach((header, index) => {
        const value = row[index];
        if (header && value !== null && value !== "") {
          cleanedRow[header] = value;
        }
      });
      return cleanedRow;
    });

    const last24MonthsDate = new Date();
    last24MonthsDate.setMonth(last24MonthsDate.getMonth() - 24);

    const filteredData = cleanedData.filter((row) => {
      const usPublishDate = convertExcelDate(row.US_PublishDate);
      return (
        usPublishDate >= last24MonthsDate &&
        row.Basin?.toLowerCase() === "permian"
      );
    });

    const formattedData = filteredData.map((row) => [
      row.Basin,
      row["State/Province"],
      row.County,
      Number(row["Rig Count Value"]) || 0,
      Number(row["prior_week"]) || 0,
      Number(row["prior_Year"]) || 0,
      Number(row["52_wk_high"]) || 0,
      Number(row["52_wk_low"]) || 0,
      0, 0, 0, 0, // placeholder for calculations
      row.Year,
      row.Month,
      formatDate(convertExcelDate(row.US_PublishDate)),
    ]);

    const totalInserted = await processFileData(formattedData);
    res.status(200).json({
      message: "File processed and data inserted successfully.",
      dataInserted: totalInserted,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("Error in uploadXlsx:", error);
    res.status(500).json({ message: "Error processing file.", error });
  }
};


exports.getDocumentData = (req, res) => {
  insertData.getAllData((data, err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch data",
        data: null,
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Data fetched successfully.",
        data: data,
      });
    }
  });
};
