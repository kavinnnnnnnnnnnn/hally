const { ExecutionLog } = require('./src/models');
ExecutionLog.findOne({ 
  where: { execution_id: '2e7b59fe-a16b-4cae-851f-8c818100407a' },
  order: [['createdAt', 'DESC']]
}).then(log => {
  console.log('--- LOG ENTRY START ---');
  console.log(JSON.stringify(log, null, 2));
  console.log('--- LOG ENTRY END ---');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
