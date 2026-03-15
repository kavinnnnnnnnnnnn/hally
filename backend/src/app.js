const express = require("express")
const cors = require("cors")

const workflowRoutes = require("./routes/workflowRoutes")
const stepRoutes = require("./routes/stepRoutes")
const ruleRoutes = require("./routes/ruleRoutes")
const executionRoutes = require("./routes/executionRoutes")

const sequelize = require("./config/db")

const { Workflow, Step, Rule, Execution, ExecutionLog } = require("./models")
const ruleEngine = require("./services/ruleEngine")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Workflow Automation Engine API is running" });
});

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate()
    res.json({
      status: "ok",
      server: "running",
      database: "connected"
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      server: "running",
      database: "disconnected",
      error: error.message
    })
  }
})

app.post("/api/test/workflow", async (req, res) => {
  try {
    const testWorkflow = await Workflow.create({
      name: "Expense Approval Test",
      version: 1,
      is_active: true,
      input_schema: {
        amount: { type: "number" },
        country: { type: "string" },
        priority: { type: "string" }
      }
    })
    res.status(201).json(testWorkflow)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/steps", async (req, res) => {
  try {
    const { workflow_id } = req.body
    if (!workflow_id) {
      return res.status(400).json({ error: "workflow_id is required" })
    }

    const steps = await Step.bulkCreate([
      { name: "Manager Approval", step_type: "approval", order: 1, workflow_id },
      { name: "Finance Notification", step_type: "notification", order: 2, workflow_id },
      { name: "Task Rejection", step_type: "task", order: 3, workflow_id }
    ])

    res.status(201).json(steps)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/rules", async (req, res) => {
  try {
    const { step_id } = req.body
    if (!step_id) {
      return res.status(400).json({ error: "step_id is required" })
    }

    const currentStep = await Step.findByPk(step_id)
    if (!currentStep) {
      return res.status(404).json({ error: "Primary step not found" })
    }

    // Resolve target step names to IDs in the same workflow
    const targetSteps = await Step.findAll({
      where: {
        workflow_id: currentStep.workflow_id,
        name: ["Finance Notification", "Task Rejection"]
      }
    })

    const financeStep = targetSteps.find(s => s.name === "Finance Notification")
    const rejectStep = targetSteps.find(s => s.name === "Task Rejection")

    const rules = await Rule.bulkCreate([
      {
        step_id,
        priority: 1,
        condition: "data.amount > 100 && data.country == 'US' && data.priority == 'High'",
        next_step_id: financeStep?.id
      },
      {
        step_id,
        priority: 2,
        condition: "data.amount <= 100",
        next_step_id: rejectStep?.id
      },
      {
        step_id,
        priority: 3,
        condition: "DEFAULT",
        next_step_id: rejectStep?.id
      }
    ])

    res.status(201).json(rules)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/execute", async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ 
      where: { name: "Expense Approval Test" },
      order: [["createdAt", "DESC"]]
    })
    if (!workflow) return res.status(404).json({ error: "Workflow not found" })

    const startStep = await Step.findOne({
      where: { workflow_id: workflow.id, name: "Manager Approval" }
    })
    if (!startStep) return res.status(404).json({ error: "Start step not found" })

    const rules = await Rule.findAll({
      where: { step_id: startStep.id },
      order: [["priority", "ASC"]]
    })

    const matchedRule = ruleEngine.evaluate(rules, req.body)
    const nextStepId = matchedRule ? matchedRule.next_step_id : null
    
    let nextStepName = "None"
    if (nextStepId) {
      const nextStep = await Step.findByPk(nextStepId)
      nextStepName = nextStep?.name || "Unknown"
    }

    const execution = await Execution.create({
      workflow_id: workflow.id,
      status: "COMPLETED",
      data: req.body,
      current_step_id: startStep.id
    })

    await ExecutionLog.create({
      execution_id: execution.id,
      step_name: startStep.name,
      status: "SUCCESS",
      rule_evaluated: matchedRule ? matchedRule.condition : "No rule matched / Default",
      result: matchedRule ? "TRUE" : "FALSE/DEFAULT"
    })

    res.json({
      execution_id: execution.id,
      current_step: startStep.name,
      next_step: nextStepName,
      status: "completed"
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/test/database-status", async (req, res) => {
  try {
    const counts = {
      workflows: await Workflow.count(),
      steps: await Step.count(),
      rules: await Rule.count(),
      executions: await Execution.count(),
      execution_logs: await ExecutionLog.count()
    }
    res.json(counts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.use("/api", workflowRoutes)
app.use("/api/workflows/:workflow_id/steps", stepRoutes)
app.use("/api/steps", stepRoutes)
app.use("/api/steps/:step_id/rules", ruleRoutes)
app.use("/api/rules", ruleRoutes)
app.use("/api/executions", executionRoutes)

module.exports = app