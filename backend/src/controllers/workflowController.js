const { Workflow, Step, Rule } = require("../models")

// Create new workflow
exports.createWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.create(req.body)
    res.status(201).json(workflow)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const { Op } = require("sequelize")

// Get all workflows (with pagination and search)
exports.getWorkflows = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    const { count, rows } = await Workflow.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]]
    })

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      workflows: rows
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get single workflow by ID
exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id, {
      include: [
        {
          model: Step,
          as: "steps",
          include: [
            {
              model: Rule,
              as: "rules"
            }
          ]
        }
      ]
    })
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }
    
    res.json(workflow)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update workflow (increments version)
exports.updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id)
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }
    
    // Increment version if name or is_active changes
    const newVersion = workflow.version + 1
    
    await workflow.update({
      ...req.body,
      version: newVersion
    })
    
    res.json(workflow)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id)
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }
    
    await workflow.destroy()
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}