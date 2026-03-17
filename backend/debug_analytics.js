const { Execution, Workflow, Step, Rule } = require('./src/models');
const sequelize = require('./src/config/db');
const { Op } = require('sequelize');

async function testAnalytics() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Querying executions since:', sevenDaysAgo);

    const dailyStats = await Execution.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        'status'
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      raw: true
    });

    console.log('Daily Stats Count:', dailyStats.length);
    console.log('Sample Stat:', dailyStats[0]);

    const failures = await Execution.findAll({
      attributes: [
        'error_message',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: { [Op.or]: ['FAILED', 'ERROR'] },
        error_message: { [Op.ne]: null }
      },
      group: ['error_message'],
      raw: true
    });

    console.log('Failures count:', failures.length);
    console.log('Sample Failure:', failures[0]);

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testAnalytics();
