const { Workflow, Step, Rule, Execution, ExecutionLog } = require("../models")
const ruleEngine = require("./ruleEngine")

/**
 * Service to manage workflow execution lifecycle
 */
class ExecutionEngineService {
  /**
   * Start a new workflow execution
   */
  async executeWorkflow(workflowId, inputData, triggeredBy = "API") {
    try {
      const workflow = await Workflow.findByPk(workflowId)
      if (!workflow) throw new Error("Workflow not found")
      if (!workflow.start_step_id) throw new Error("Workflow has no start step")

      const execution = await Execution.create({
        workflow_id: workflowId,
        workflow_version: workflow.version,
        status: "RUNNING",
        data: inputData,
        current_step_id: workflow.start_step_id,
        triggered_by: triggeredBy
      })

      // Start processing steps
      return await this.processStep(execution.id)
    } catch (error) {
      console.error("Execute Workflow Error:", error)
      throw error
    }
  }

  /**
   * Process the current step of an execution cycle
   */
  async processStep(executionId, iterationCount = 0) {
    const MAX_ITERATIONS = 50 // Infinite loop protection
    const MAX_RETRIES = process.env.MAX_RETRY_LIMIT || 3

    if (iterationCount > MAX_ITERATIONS) {
      const exec = await Execution.findByPk(executionId)
      await exec.update({ status: "FAILED" })
      await ExecutionLog.create({
        execution_id: executionId,
        step_name: "SYSTEM",
        status: "ERROR",
        error_message: "Infinite loop detected: Maximum iteration count exceeded"
      })
      throw new Error("Infinite loop detected")
    }

    const execution = await Execution.findByPk(executionId)
    if (!execution || execution.status !== "RUNNING") return execution

    const currentStepId = execution.current_step_id
    const step = await Step.findByPk(currentStepId, {
      include: [{ model: Rule, as: "rules" }]
    })

    if (!step) {
      await execution.update({ status: "FAILED" })
      await ExecutionLog.create({
        execution_id: executionId,
        step_name: "Unknown",
        status: "ERROR",
        error_message: `Step ${currentStepId} not found`
      })
      return execution
    }

    const startTime = new Date()
    try {
      // Delegate rule evaluation to the dedicated RuleEngine service
      const { matchedRule, error: evaluationError } = ruleEngine.evaluate(step.rules, execution.data)
      const nextStepId = matchedRule ? matchedRule.next_step_id : null

      // Validate next step existence if it exists
      if (nextStepId) {
        const nextStep = await Step.findByPk(nextStepId)
        if (!nextStep) {
          throw new Error(`Target step ${nextStepId} not found in database`)
        }
      }

      await ExecutionLog.create({
        execution_id: executionId,
        step_name: step.name,
        rule_evaluated: matchedRule ? matchedRule.condition : (evaluationError ? "Evaluation Error" : "No rule matched / Default"),
        result: matchedRule ? "TRUE" : (evaluationError ? "ERROR" : "FALSE/DEFAULT"),
        selected_next_step: nextStepId || "FINISH",
        status: evaluationError ? "WARNING" : "COMPLETED",
        error_message: evaluationError,
        approver_id: step.step_type === "approval" ? step.metadata?.approver_id : null,
        started_at: startTime,
        ended_at: new Date()
      })

      if (nextStepId) {
        await execution.update({ 
          current_step_id: nextStepId,
          error_message: evaluationError,
          approver_id: step.step_type === "approval" ? step.metadata?.approver_id : execution.approver_id
        })
        return await this.processStep(execution.id, iterationCount + 1) // Transition with safety increment
      } else {
        await execution.update({ 
          status: "COMPLETED",
          error_message: evaluationError,
          approver_id: step.step_type === "approval" ? step.metadata?.approver_id : execution.approver_id
        })
        return execution
      }
    } catch (error) {
      console.error(`Process Step Error (ID: ${currentStepId}):`, error)
      
      const currentRetries = execution.retries || 0
      const canRetry = currentRetries < MAX_RETRIES

      await execution.update({ 
        status: canRetry ? "RUNNING" : "FAILED",
        retries: currentRetries + 1,
        error_message: error.message
      })

      await ExecutionLog.create({
        execution_id: executionId,
        step_name: step.name,
        status: canRetry ? "RETRYING" : "FATAL",
        error_message: error.message,
        started_at: startTime,
        ended_at: new Date()
      })

      if (canRetry) {
        // Optional: add a small delay before retry
        return await this.processStep(execution.id, iterationCount)
      }
      
      throw error
    }
  }
}

module.exports = new ExecutionEngineService()
