const express = require("express")
const router = express.Router({ mergeParams: true }) // mergeParams for step_id
const controller = require("../controllers/ruleController")

// Nested routes: /api/steps/:step_id/rules
router.post("/", controller.createRule)
router.get("/", controller.getRulesByStep)

// Standalone routes: /api/rules/:id
router.put("/:id", controller.updateRule)
router.delete("/:id", controller.deleteRule)

module.exports = router
