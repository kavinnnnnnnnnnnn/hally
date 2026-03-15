const express = require("express")
const router = express.Router()
const controller = require("../controllers/executionController")

// Execution management
router.get("/", controller.getAllExecutions)
router.get("/:id", controller.getExecutionStatus)
router.post("/:id/cancel", controller.cancelExecution)
router.post("/:id/retry", controller.retryExecution)

// Start execution is often nested under workflows
// But we can also mount it here or in workflowRoutes
router.post("/workflows/:workflow_id/execute", controller.startExecution)

module.exports = router
