const express = require("express")
const router = express.Router()
const controller = require("../controllers/workflowController")

// Define REST API routes
router.post("/workflows", controller.createWorkflow)
router.get("/workflows", controller.getWorkflows)
router.get("/workflows/:id", controller.getWorkflow)
router.put("/workflows/:id", controller.updateWorkflow)
router.delete("/workflows/:id", controller.deleteWorkflow)

module.exports = router