const express = require("express")
const cors = require("cors")

const workflowRoutes = require("./routes/workflowRoutes")
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

app.post("/api/log-error", (req, res) => {
  console.log(">>> REACT CRASH ENCOUNTERED <<<");
  console.log(req.body.error);
  console.log(req.body.stack);
  res.send('ok');
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

app.post("/api/test/create-workflow", async (req, res) => {
  try {
    const testWorkflow = await Workflow.create({
      name: "Expense Approval Test",
      version: 1,
      is_active: true,
      input_schema: {
        "amount": {"type":"number","required":true},
        "country": {"type":"string","required":true},
        "department": {"type":"string","required":false},
        "priority": {"type":"string","required":true}
      }
    })
    res.status(201).json(testWorkflow)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/create-steps", async (req, res) => {
  try {
    const { workflow_id } = req.body
    if (!workflow_id) {
      return res.status(400).json({ error: "workflow_id is required" })
    }

    const workflow = await Workflow.findByPk(workflow_id);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const steps = await Step.bulkCreate([
      { 
        name: "Manager Approval", 
        step_type: "approval", 
        order: 1, 
        workflow_id,
        metadata: { assignee_email: "manager@example.com" }
      },
      { 
        name: "Finance Notification", 
        step_type: "notification", 
        order: 2, 
        workflow_id,
        metadata: { channel: "email" }
      },
      { 
        name: "Task Rejection", 
        step_type: "task", 
        order: 3, 
        workflow_id 
      }
    ])

    // Set start step
    await workflow.update({ start_step_id: steps[0].id });

    res.status(201).json(steps)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/create-rules", async (req, res) => {
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
        condition: "amount > 100 && country == 'US' && priority == 'High'",
        next_step_id: financeStep?.id
      },
      {
        step_id,
        priority: 2,
        condition: "amount <= 100",
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
    // Phase 5 requires loading workflow, finding start step, evaluating rules, and storing execution + logs.
    // Our ExecutionEngineService already does this in a more robust way.
    const workflow = await Workflow.findOne({ 
      where: { name: "Expense Approval Test" },
      order: [["createdAt", "DESC"]]
    })
    if (!workflow) return res.status(404).json({ error: "Workflow not found" })

    const ExecutionEngineService = require("./services/ExecutionEngineService");
    const execution = await ExecutionEngineService.executeWorkflow(workflow.id, req.body)
    
    // Fetch result with the next step name for Phase 5 response requirement
    const finalExec = await Execution.findByPk(execution.id);
    const lastLog = await ExecutionLog.findOne({
      where: { execution_id: execution.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      execution_id: execution.id,
      workflow: workflow.name,
      current_step: "Manager Approval", // First step as per challenge
      next_step: lastLog?.selected_next_step || "FINISH",
      status: execution.status.toLowerCase()
    })
  } catch (error) {
    console.error("Test Execute Error:", error);
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

app.post("/api/test/fix-start-steps", async (req, res) => {
  try {
    const workflows = await Workflow.findAll()
    const results = []
    for (const workflow of workflows) {
      const startStep = await Step.findOne({
        where: { workflow_id: workflow.id, name: "Manager Approval" }
      })
      if (startStep) {
        await workflow.update({ start_step_id: startStep.id })
        results.push(`Updated ${workflow.name} (${workflow.id}) -> ${startStep.id}`)
      }
    }
    res.json({ message: "Data fix complete", results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Standardized Routing
app.use("/api/workflows", workflowRoutes)
app.use("/api/executions", executionRoutes)

module.exports = app