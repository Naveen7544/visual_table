const dbConn = require("../../dbConfig");

exports.insertData = (formattedData) => {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO `clientdata` (`basin`, `state`, `county`, `current_rigs`,`prior_week`, `prior_Year`,`52_wk_high`, `52_wk_low`, `prior_wk_chg`, `prior_yr_chg`, `52_wk_high_chg`, `52_wk_low_chg`, `Year`, `Month`, `US_PublishDate`) VALUES ?";

    dbConn.query(query, [formattedData], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.getAllData = (callback) => {
  let user = "Select * From clientdata";

  dbConn.query(user, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(res);
    }
  });
};
