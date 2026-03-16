require("dotenv").config()

const app = require("./app")
const sequelize = require("./config/db")
const { Workflow, Step } = require("./models") // Load models and associations

const PORT = process.env.PORT || 5001

async function autoFixStartSteps() {
  try {
    // Find all workflows with no start_step_id and auto-assign first step
    const workflows = await Workflow.findAll({ where: { start_step_id: null } })
    for (const wf of workflows) {
      const firstStep = await Step.findOne({
        where: { workflow_id: wf.id },
        order: [["order", "ASC"]]
      })
      if (firstStep) {
        await wf.update({ start_step_id: firstStep.id })
        console.log(`[AutoFix] Set start_step_id for workflow "${wf.name}" → ${firstStep.name}`)
      }
    }
  } catch (err) {
    console.warn("[AutoFix] Could not auto-fix start steps:", err.message)
  }
}

// Use sync() without alter — schema is already set up correctly.
// alter:true causes Sequelize to drop & recreate FKs on every restart,
// which breaks on the 2nd run (FK was already renamed by the 1st run).
sequelize.sync().then(async () => {

  await autoFixStartSteps()

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  // Gracefully handle port-in-use
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${PORT} is still in use.`)
      console.error(`   Run: lsof -ti :${PORT} | xargs kill -9\n`)
      process.exit(1)
    } else {
      throw err
    }
  })

})