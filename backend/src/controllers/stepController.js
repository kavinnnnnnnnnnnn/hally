const { Step, Workflow } = require("../models")

// Create step for a workflow
exports.createStep = async (req, res) => {
  try {
    const { workflow_id } = req.params
    const workflow = await Workflow.findByPk(workflow_id)
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }
    
    // Auto-calculate order if not provided
    if (req.body.order === undefined) {
      const maxOrder = await Step.max('order', { where: { workflow_id } });
      req.body.order = (maxOrder || 0) + 1;
    }

    const step = await Step.create({
      ...req.body,
      workflow_id
    })

    // If workflow has no start_step_id, set this first step as the start
    if (!workflow.start_step_id) {
      await workflow.update({ start_step_id: step.id })
    }
    
    res.status(201).json(step)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// List steps for a workflow
exports.getStepsByWorkflow = async (req, res) => {
  try {
    const { workflow_id } = req.params
    const steps = await Step.findAll({
      where: { workflow_id },
      order: [["order", "ASC"]]
    })
    res.json(steps)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update step
exports.updateStep = async (req, res) => {
  try {
    const step = await Step.findByPk(req.params.id)
    
    if (!step) {
      return res.status(404).json({ error: "Step not found" })
    }
    
    await step.update(req.body)
    res.json(step)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete step
exports.deleteStep = async (req, res) => {
  try {
    const step = await Step.findByPk(req.params.id)
    
    if (!step) {
      return res.status(404).json({ error: "Step not found" })
    }
    
    const workflowId = step.workflow_id;
    await step.destroy()

    // Fix orphaned start_step_id by assigning to the next available step
    const workflow = await Workflow.findByPk(workflowId);
    if (workflow && workflow.start_step_id === step.id) {
      const nextStep = await Step.findOne({
        where: { workflow_id: workflowId },
        order: [['order', 'ASC']]
      });
      await workflow.update({ start_step_id: nextStep ? nextStep.id : null });
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
