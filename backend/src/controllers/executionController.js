const ExecutionEngineService = require("../services/ExecutionEngineService")
const { Execution, ExecutionLog } = require("../models")

// Start workflow execution
exports.startExecution = async (req, res) => {
  try {
    const { workflow_id } = req.params
    const execution = await ExecutionEngineService.executeWorkflow(workflow_id, req.body)
    res.status(201).json(execution)
  } catch (error) {
    res.status(400).json({ error: error.message })
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