const { Rule, Step, Workflow } = require("../models")

// Create rule for a step
exports.createRule = async (req, res) => {
  try {
    const step_id = req.params.step_id || req.body.step_id
    const workflow_id = req.params.workflow_id || req.body.workflow_id
    
    // Mapping frontend fields to backend
    if (req.body.nextStep) {
      // If it looks like a name (not a UUID), try to resolve it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.body.nextStep)) {
        // Find step by name in the same workflow
        const targetWorkflowId = workflow_id || (step_id ? (await Step.findByPk(step_id))?.workflow_id : null);
        if (targetWorkflowId) {
          const targetStep = await Step.findOne({
            where: {
              workflow_id: targetWorkflowId,
              name: req.body.nextStep
            }
          });
          if (targetStep) {
            req.body.next_step_id = targetStep.id;
          }
        }
      } else {
        req.body.next_step_id = req.body.nextStep;
      }
    }

    if (!step_id) {
      // Fallback: finding first step of workflow if workflow_id provided
      if (workflow_id) {
        let firstStep = await Step.findOne({ where: { workflow_id }, order: [['order', 'ASC']] });
        
        // If no steps exist at all, create an "Initial Step" automatically
        if (!firstStep) {
          console.log(`Auto-creating initial step for workflow ${workflow_id}`);
          firstStep = await Step.create({
            name: "Initial Step",
            step_type: "task",
            order: 1,
            workflow_id
          });
          
          // Also update the workflow's start_step_id if it's currently null
          const workflow = await Workflow.findByPk(workflow_id);
          if (workflow && !workflow.start_step_id) {
            await workflow.update({ start_step_id: firstStep.id });
          }
        }
        
        req.body.step_id = firstStep.id;
      }
    } else {
      req.body.step_id = step_id;
    }
    
    if (!req.body.step_id) {
      return res.status(400).json({ error: "Step ID is required to create a rule" })
    }

    const rule = await Rule.create(req.body)
    res.status(201).json(rule)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// List rules for a step (ordered by priority)
exports.getRulesByStep = async (req, res) => {
  try {
    const { step_id } = req.params
    const rules = await Rule.findAll({
      where: { step_id },
      order: [["priority", "ASC"]]
    })
    res.json(rules)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update rule
exports.updateRule = async (req, res) => {
  try {
    const rule = await Rule.findByPk(req.params.id)
    
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" })
    }

    // Mapping frontend fields to backend
    if (req.body.nextStep) {
      // If it looks like a name (not a UUID), try to resolve it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.body.nextStep)) {
        // Find step by name in the same workflow
        const targetStep = await Step.findOne({
          where: {
            workflow_id: rule.workflow_id || (await Step.findByPk(rule.step_id))?.workflow_id,
            name: req.body.nextStep
          }
        });
        if (targetStep) {
          req.body.next_step_id = targetStep.id;
        }
      } else {
        req.body.next_step_id = req.body.nextStep;
      }
    }
    
    await rule.update(req.body)
    res.json(rule)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete rule
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByPk(req.params.id)
    
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" })
    }
    
    await rule.destroy()
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
