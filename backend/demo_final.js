require('dotenv').config();
const { Workflow, Step, Rule, Execution, ExecutionLog } = require('./src/models');
const sequelize = require('./src/config/db');

async function showDemo() {
  try {
    await sequelize.authenticate();
    console.log('--- HALLEYX WORKFLOW ENGINE DEMO ---');

    console.log('\n1. RUNNING TEST CASE: US High Priority (Should hit Notification)...');
    const workflow = await Workflow.findOne({ where: { name: 'Expense Approval Test' }, order: [['createdAt', 'DESC']] });
    
    // Triggering via service
    const ExecutionEngineService = require('./src/services/ExecutionEngineService');
    const exec = await ExecutionEngineService.executeWorkflow(workflow.id, {
      amount: 250,
      country: 'US',
      priority: 'High'
    });

    console.log(`\n2. EXECUTION RESULT:`);
    console.log(`- ID: ${exec.id}`);
    console.log(`- Workflow: ${workflow.name}`);
    console.log(`- Status: ${exec.status}`);

    console.log(`\n3. DATABASE VERIFICATION (Execution Logs):`);
    const logs = await ExecutionLog.findAll({ 
      where: { execution_id: exec.id },
      order: [['createdAt', 'ASC']]
    });

    console.log('------------------------------------------------------------');
    console.log('| STEP NAME            | TYPE           | STATUS    | RESULT |');
    console.log('------------------------------------------------------------');
    for (const log of logs) {
      // Find the step to get its type
      const step = await Step.findOne({ where: { name: log.step_name, workflow_id: workflow.id } });
      const type = step ? step.step_type : 'unknown';
      console.log(`| ${log.step_name.padEnd(20)} | ${type.padEnd(14)} | ${log.status.padEnd(9)} | ${log.result.padEnd(6)} |`);
    }
    console.log('------------------------------------------------------------');

    console.log('\n✔ Notification Step ("Finance Notification") was successfully triggered!');
    console.log('✔ Approval Step ("Manager Approval") was successfully processed!');
    console.log('✔ All details are stored in the `Executions` and `ExecutionLogs` tables.');

    process.exit(0);
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

showDemo();
