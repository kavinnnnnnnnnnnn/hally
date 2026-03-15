require('dotenv').config();
const { Workflow, Step } = require('./src/models');
const sequelize = require('./src/config/db');

async function fixDB() {
  try {
    await sequelize.authenticate();
    const workflows = await Workflow.findAll();
    for (const w of workflows) {
      let startStep = w.start_step_id ? await Step.findByPk(w.start_step_id) : null;
      if (!startStep) {
        const firstStep = await Step.findOne({
          where: { workflow_id: w.id },
          order: [['order', 'ASC']]
        });
        if (firstStep) {
          await w.update({ start_step_id: firstStep.id });
          console.log(`Fixed workflow "${w.name}": New start_step_id = ${firstStep.id}`);
        } else {
          await w.update({ start_step_id: null });
          console.log(`Workflow "${w.name}" has no steps. Set start_step_id = null`);
        }
      }
    }
    console.log('Orphaned start steps fixed.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixDB();
