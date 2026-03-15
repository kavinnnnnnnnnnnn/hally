const express = require("express")
const router = express.Router({ mergeParams: true }) // mergeParams for workflow_id
const controller = require("../controllers/stepController")

// Nested routes: /api/workflows/:workflow_id/steps
router.post("/", controller.createWorkflow ? controller.createWorkflow : controller.createStep) // Fallback check just in case
router.get("/", controller.getStepsByWorkflow)

// Standalone routes: /api/steps/:id
router.put("/:id", controller.updateStep)
router.delete("/:id", controller.deleteStep)

module.exports = router
