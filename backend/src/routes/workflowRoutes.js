const express = require("express")
const router = express.Router()
const workflowController = require("../controllers/workflowController")
const executionController = require("../controllers/executionController")
const stepRoutes = require("./stepRoutes")
const ruleRoutes = require("./ruleRoutes")

// Define REST API routes (mounted at /api/workflows in app.js)
router.get("/stats", workflowController.getStats)
router.get("/analytics", workflowController.getAnalytics)
router.post("/", workflowController.createWorkflow)
router.get("/", workflowController.getWorkflows)
router.get("/:id", workflowController.getWorkflow)
router.put("/:id", workflowController.updateWorkflow)
router.delete("/:id", workflowController.deleteWorkflow)

// Aggregate Rules for a workflow
router.get("/:id/rules", workflowController.getWorkflowRules)

// Execution endpoint
router.post("/:workflow_id/execute", executionController.startExecution)

// Nested routes
router.use("/:workflow_id/steps", stepRoutes)
router.use("/:workflow_id/rules", ruleRoutes)

module.exports = router