const { Step, Workflow } = require("../models")

// Create step for a workflow
exports.createStep = async (req, res) => {
  try {
    const { workflow_id } = req.params
    const workflow = await Workflow.findByPk(workflow_id)
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }
    
    const step = await Step.create({
      ...req.body,
      workflow_id
    })
    
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
    
    await step.destroy()
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
