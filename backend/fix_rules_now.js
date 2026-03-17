require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { Rule, Step } = require('./src/models');

const MANAGER_APPROVAL_STEP = 'dfbfb41b-d618-4178-a002-04239c0cd3e4';
const CEO_APPROVAL_STEP     = 'a910ae18-0c59-4a83-9e6f-1614093a1017';
const TASK_REJECTION_STEP   = 'b8300a44-1e9b-4342-be5d-51c22610c710';

async function fix() {
  // 1. Fix any rule with null next_step_id on Manager Approval
  const [fixed] = await Rule.update(
    { next_step_id: CEO_APPROVAL_STEP },
    { where: { step_id: MANAGER_APPROVAL_STEP, next_step_id: null } }
  );
  console.log('Fixed', fixed, 'rule(s) with null next_step_id -> CEO Approval');

  // 2. Add DEFAULT rule if not present
  const existing = await Rule.findOne({
    where: { step_id: MANAGER_APPROVAL_STEP, condition: 'DEFAULT' }
  });
  if (!existing) {
    await Rule.create({
      id: uuidv4(),
      step_id: MANAGER_APPROVAL_STEP,
      priority: 99,
      condition: 'DEFAULT',
      next_step_id: TASK_REJECTION_STEP
    });
    console.log('Added DEFAULT rule -> Task Rejection');
  } else {
    console.log('DEFAULT rule already exists, next_step_id:', existing.next_step_id);
  }

  // 3. Verify
  const rules = await Rule.findAll({
    where: { step_id: MANAGER_APPROVAL_STEP },
    order: [['priority', 'ASC']]
  });
  console.log('\n=== Current rules on Manager Approval ===');
  for (const r of rules) {
    const ns = await Step.findByPk(r.next_step_id);
    console.log('  [priority', r.priority, ']', `"${r.condition}"`, '->', ns ? ns.name : 'NULL');
  }
}

fix().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
