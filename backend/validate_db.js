require('dotenv').config();
const { Workflow, Step, Rule, Execution, ExecutionLog } = require('./src/models');
const sequelize = require('./src/config/db');

async function validateDatabase() {
  try {
    await sequelize.authenticate();
    console.log('--- Phase 9: Database Validation ---');

    const w = await Workflow.findOne({ 
      where: { name: 'Expense Approval Test' }, 
      order: [['createdAt', 'DESC']] 
    });
    
    if (w) {
      console.log('\n✔ Workflow Stored:');
      console.log(JSON.stringify(w.toJSON(), null, 2));

      const steps = await Step.findAll({ where: { workflow_id: w.id }, order: [['order', 'ASC']] });
      console.log(`\n✔ Steps Stored (${steps.length}):`);
      steps.forEach(s => console.log(`- ${s.name} (${s.step_type})` || s.toJSON()));

      const rules = await Rule.findAll({ where: { step_id: w.start_step_id } });
      console.log(`\n✔ Rules Stored for Start Step (${rules.length}):`);
      rules.forEach(r => console.log(`- PRIORITY ${r.priority}: ${r.condition} -> ${r.next_step_id}`));

      const executions = await Execution.findAll({ 
        where: { workflow_id: w.id }, 
        limit: 2, 
        order: [['createdAt', 'DESC']] 
      });
      console.log(`\n✔ Executions Created (${executions.length}):`);
      executions.forEach(e => console.log(`- EXEC ${e.id}: STATUS ${e.status}`));

      const logs = await ExecutionLog.findAll({ where: { execution_id: executions[0].id } });
      console.log(`\n✔ Logs Recorded for latest execution (${logs.length}):`);
      logs.forEach(l => console.log(`- STEP ${l.step_name}: ${l.status}`));
    }
    
    console.log('\n--- DATABASE VALIDATION COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

validateDatabase();
