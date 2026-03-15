const ExecutionEngineService = require("../services/ExecutionEngineService")
const { Execution, ExecutionLog, Workflow } = require("../models")

// Start workflow execution
exports.startExecution = async (req, res) => {
  try {
    const { workflow_id } = req.params
    // Frontend sends inputs as { inputs: { ... } }
    const inputData = req.body.inputs || req.body
    const executionResult = await ExecutionEngineService.executeWorkflow(workflow_id, inputData)
    
    // Fetch with logs to provide steps information to frontend
    const execution = await Execution.findByPk(executionResult.id, {
      include: [{ model: ExecutionLog, as: "logs" }]
    })
    
    // Map logs to 'steps' for frontend compatibility if needed
    const responseData = execution.toJSON()
    responseData.steps = responseData.logs || []
    
    res.status(201).json(responseData)
  } catch (error) {
    console.error('Execution Error:', error)
    res.status(400).json({ error: error.message })
  }
}

// Get all execution logs (for frontend Logs page)
exports.getAllExecutions = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const executions = await Execution.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: Workflow, as: "Workflow", attributes: ["name"] }]
    })
    res.json(executions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get execution status and logs
exports.getExecutionStatus = async (req, res) => {
  try {
    const execution = await Execution.findByPk(req.params.id, {
      include: [{ model: ExecutionLog, as: "logs" }]
    })
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" })
    }
    
    res.json(execution)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Cancel execution
exports.cancelExecution = async (req, res) => {
  try {
    const execution = await Execution.findByPk(req.params.id)
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" })
    }
    
    if (execution.status !== "RUNNING") {
      return res.status(400).json({ error: "Execution is not running" })
    }
    
    await execution.update({ status: "CANCELLED" })
    res.json({ message: "Execution cancelled" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Retry execution
exports.retryExecution = async (req, res) => {
  try {
    const execution = await Execution.findByPk(req.params.id)
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" })
    }
    
    if (execution.status !== "FAILED") {
      return res.status(400).json({ error: "Can only retry failed executions" })
    }
    
    await execution.update({ status: "RUNNING" })
    
    // Resume processing
    const updatedExecution = await ExecutionEngineService.processStep(execution.id)
    res.json(updatedExecution)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}