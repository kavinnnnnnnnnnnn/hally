const { Rule, Step } = require("../models")

// Create rule for a step
exports.createRule = async (req, res) => {
  try {
    const { step_id } = req.params
    const step = await Step.findByPk(step_id)
    
    if (!step) {
      return res.status(404).json({ error: "Step not found" })
    }
    
    const rule = await Rule.create({
      ...req.body,
      step_id
    })
    
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
