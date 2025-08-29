const { sequelize } = require("../database/models");

/**
 * Run a function inside a sequelize transaction.
 * It will automatically commit or rollback.
 *
 * @param {Function} callback - async function that receives the transaction
 * @returns {Promise<any>}
 */
async function withTransaction(callback) {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = withTransaction;
