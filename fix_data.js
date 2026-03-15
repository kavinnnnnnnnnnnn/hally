const { Workflow, Step } = require("./hally/backend/src/models");
const sequelize = require("./hally/backend/src/config/db");

async function fixData() {
  try {
    const workflows = await Workflow.findAll();
    for (const workflow of workflows) {
      const startStep = await Step.findOne({
        where: { workflow_id: workflow.id, name: "Manager Approval" }
      });
      if (startStep) {
        await workflow.update({ start_step_id: startStep.id });
        console.log(`Updated workflow ${workflow.name} (${workflow.id}) with start_step_id ${startStep.id}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixData();
