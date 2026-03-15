require('dotenv').config();
const { Workflow, Step } = require('./src/models');
const sequelize = require('./src/config/db');

async function fixStartSteps() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const workflows = await Workflow.findAll({ where: { start_step_id: null } });
    console.log(`Found ${workflows.length} workflows with no start step.`);

    for (const w of workflows) {
      const firstStep = await Step.findOne({
        where: { workflow_id: w.id },
        order: [['order', 'ASC']]
      });
      if (firstStep) {
        await w.update({ start_step_id: firstStep.id });
        console.log(`Updated workflow "${w.name}" with start step "${firstStep.name}"`);
      } else {
        console.log(`Workflow "${w.name}" has no steps to set as start.`);
      }
    }
    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixStartSteps();
