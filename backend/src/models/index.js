const Workflow = require("./Workflow")
const Step = require("./Step")
const Rule = require("./Rule")
const Execution = require("./Execution")
const ExecutionLog = require("./ExecutionLog")

// Define relationships
Workflow.hasMany(Step, { foreignKey: "workflow_id", as: "steps", onDelete: "CASCADE", hooks: true })
Step.belongsTo(Workflow, { foreignKey: "workflow_id" })

Step.hasMany(Rule, { foreignKey: "step_id", as: "rules", onDelete: "CASCADE", hooks: true })
Rule.belongsTo(Step, { foreignKey: "step_id" })

Workflow.hasMany(Execution, { foreignKey: "workflow_id", as: "executions", onDelete: "CASCADE", hooks: true })
Execution.belongsTo(Workflow, { foreignKey: "workflow_id" })

Execution.hasMany(ExecutionLog, { foreignKey: "execution_id", as: "logs", onDelete: "CASCADE", hooks: true })
ExecutionLog.belongsTo(Execution, { foreignKey: "execution_id" })

module.exports = {
  Workflow,
  Step,
  Rule,
  Execution,
  ExecutionLog
}
