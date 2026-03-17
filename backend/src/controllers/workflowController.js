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

const { Execution } = require("../models")

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const totalWorkflows = await Workflow.count()
    const successfulExecutions = await Execution.count({ where: { status: "COMPLETED" } })
    const failedExecutions = await Execution.count({ 
      where: { 
        status: { [Op.or]: ["FAILED", "ERROR"] } 
      } 
    })

    res.json({
      totalWorkflows,
      successfulExecutions,
      failedExecutions
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get analytics data for graphs
exports.getAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Get daily execution stats (Last 7 days)
    const dailyStats = await Execution.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        'status'
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      raw: true
    });

    // Process daily stats into a format for Recharts
    const dateMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = { date: dateStr, success: 0, failed: 0 };
    }

    dailyStats.forEach(stat => {
      const dateStr = stat.date;
      if (dateMap[dateStr]) {
        if (stat.status === 'COMPLETED') {
          dateMap[dateStr].success++;
        } else if (stat.status === 'FAILED' || stat.status === 'ERROR') {
          dateMap[dateStr].failed++;
        }
      }
    });

    const executionHistory = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Get failure analysis (Top error messages)
    const failures = await Execution.findAll({
      attributes: [
        'error_message',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: { [Op.or]: ['FAILED', 'ERROR'] },
        error_message: { [Op.ne]: null }
      },
      group: ['error_message'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 5,
      raw: true
    });

    const failureAnalysis = failures.map(f => ({
      error: f.error_message.length > 30 ? f.error_message.substring(0, 30) + '...' : f.error_message,
      count: parseInt(f.count)
    }));

    res.json({
      executionHistory,
      failureAnalysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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