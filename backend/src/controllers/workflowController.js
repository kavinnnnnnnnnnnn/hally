const { Workflow, Step, Rule } = require("../models")

// Create new workflow
exports.createWorkflow = async (req, res) => {
  try {
    const data = { ...req.body };
    // Transform inputSchema (Array) -> input_schema (Object)
    if (Array.isArray(data.inputSchema)) {
      data.input_schema = data.inputSchema.reduce((acc, field) => {
        if (field.name) acc[field.name] = { type: field.type || "string" };
        return acc;
      }, {});
      delete data.inputSchema;
    }
    
    const workflow = await Workflow.create(data)
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

    const workflowData = workflow.toJSON();
    // Transform input_schema (Object) -> inputSchema (Array)
    if (workflowData.input_schema) {
      workflowData.inputSchema = Object.entries(workflowData.input_schema).map(([name, config]) => ({
        name,
        type: config.type || "string"
      }));
    } else {
      workflowData.inputSchema = [];
    }
    
    res.json(workflowData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all rules for a workflow (Aggregate)
exports.getWorkflowRules = async (req, res) => {
  try {
    const { id } = req.params;
    const steps = await Step.findAll({
      where: { workflow_id: id },
      include: [{ model: Rule, as: "rules" }]
    });

    // Flatten rules and map fields for frontend compatibility
    const allRules = steps.flatMap(step => 
      step.rules.map(rule => {
        const r = rule.toJSON();
        return {
          ...r,
          stepName: step.name, // Helpful for UI
          nextStep: r.next_step_id // Frontend expects nextStep
        };
      })
    );

    res.json(allRules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update workflow (increments version)
exports.updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id)
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }

    const data = { ...req.body };
    // Transform inputSchema (Array) -> input_schema (Object)
    if (Array.isArray(data.inputSchema)) {
      data.input_schema = data.inputSchema.reduce((acc, field) => {
        if (field.name) acc[field.name] = { type: field.type || "string" };
        return acc;
      }, {});
      delete data.inputSchema;
    }
    
    const newVersion = workflow.version + 1
    
    await workflow.update({
      ...data,
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