const { BadRequestError } = require("../expressError");

// This function is used to convert the data to be updated into a SQL string. It takes in two arguments: dataToUpdate and jsToSql. dataToUpdate is an object with the data to be updated. jsToSql is an object that maps the keys in dataToUpdate to the column names in the database. The function returns an object with two keys: setCols and values. setCols is a string that contains the column names and values to be updated. values is an array of the values to be updated. The function throws an error if there is no data to update.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
