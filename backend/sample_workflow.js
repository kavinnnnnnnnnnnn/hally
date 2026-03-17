require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { Workflow, Step, Rule } = require('./src/models');

async function createSample() {
  const wfId = uuidv4();
  const step1Id = uuidv4();
  const step2Id = uuidv4();
  const step3Id = uuidv4();

  console.log('Creating Workflow...');
  await Workflow.create({
    id: wfId,
    name: "Sample: Manager to CEO Approval",
    version: 1,
    is_active: true,
    input_schema: {
      amount: { type: "number" },
      country: { type: "string" },
      priority: { type: "number" }
    },
    start_step_id: step1Id
  });

  console.log('Creating Steps...');
  // 1. Initial Step
  await Step.create({
    id: step1Id,
    workflow_id: wfId,
    name: "Check Conditions",
    step_type: "task",
    order: 1
  });

  // 2. CEO Approval (Terminal)
  await Step.create({
    id: step2Id,
    workflow_id: wfId,
    name: "CEO Approval",
    step_type: "approval",
    order: 2
  });

  // 3. Task Rejection (Terminal Fallback)
  await Step.create({
    id: step3Id,
    workflow_id: wfId,
    name: "Task Rejection",
    step_type: "notification",
    order: 3
  });

  console.log('Creating Rules for Check Conditions...');
  // Rule 1: MATCH -> CEO Approval
  await Rule.create({
    id: uuidv4(),
    step_id: step1Id,
    condition: "amount >= 100 && country == 'US' && priority == 7",
    priority: 1,
    next_step_id: step2Id
  });

  // Rule 2: DEFAULT -> Task Rejection
  await Rule.create({
    id: uuidv4(),
    step_id: step1Id,
    condition: "DEFAULT",
    priority: 99,
    next_step_id: step3Id
  });

  console.log(`\n✅ Created perfectly configured workflow!`);
  console.log(`Workflow ID: ${wfId}`);
  console.log(`Test URL: http://localhost:5174/workflows/${wfId}/execute`);
}

createSample().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
