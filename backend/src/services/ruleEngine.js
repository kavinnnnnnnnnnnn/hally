/**
 * Rule Engine Service
 * Evaluates rules against input data and selects the next step.
 */
class RuleEngine {
  /**
   * Evaluate a condition string safely using with(data) so bare field names
   * like `amount` and `country` resolve directly from the data object.
   *
   * @param {string} condition - e.g. "amount > 100 && country == 'US'"
   * @param {Object} data      - e.g. { amount: 20, country: "US" }
   * @returns {boolean}
   */
  evaluateCondition(condition, data) {
    try {
      // Support helper functions: contains(), startsWith(), endsWith()
      let evalString = condition
        .replace(/contains\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (_, field, val) =>
          `(${field.trim()}).includes(${JSON.stringify(val.trim())})`
        )
        .replace(/startsWith\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (_, field, val) =>
          `(${field.trim()}).startsWith(${JSON.stringify(val.trim())})`
        )
        .replace(/endsWith\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (_, field, val) =>
          `(${field.trim()}).endsWith(${JSON.stringify(val.trim())})`
        );

      // Use `with(data)` so bare identifiers (amount, country, etc.) resolve
      // from the data object — no need for a data. prefix.
      const fn = new Function("data", `with(data) { return !!(${evalString}); }`);
      return fn(data);
    } catch (error) {
      console.error(`Rule evaluation error for condition "${condition}":`, error.message);
      return false;
    }
  }

  /**
   * Evaluate a list of rules against the given input data.
   *
   * Algorithm:
   *  1. Sort rules by priority ascending.
   *  2. Separate DEFAULT rule(s) from conditional rules.
   *  3. Evaluate each conditional rule; return the first match.
   *  4. If nothing matches, fall back to the DEFAULT rule.
   *  5. If no DEFAULT exists either, return null (execution will be marked FAILED).
   *
   * @param {Rule[]} rules     - Array of Sequelize Rule instances / plain objects.
   * @param {Object} inputData - Workflow execution input.
   * @returns {{ matchedRule: Rule|null, evaluatedRules: Array, error: string|null }}
   */
  evaluate(rules, inputData) {
    console.log(`[RuleEngine] Evaluating ${rules.length} rule(s) against input:`, JSON.stringify(inputData));

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    let defaultRule = null;
    const evaluatedRules = []; // accumulate per-rule results for logging
    let evaluationError = null;

    for (const rule of sortedRules) {
      const conditionStr = (rule.condition || "").trim();

      // Treat the DEFAULT rule as a fallback — never evaluate it as a condition.
      if (conditionStr.toUpperCase() === "DEFAULT") {
        defaultRule = rule;
        continue;
      }

      try {
        const result = this.evaluateCondition(conditionStr, inputData);
        console.log(
          `[RuleEngine] Rule #${rule.id} (priority ${rule.priority}): "${conditionStr}" → ${result ? "TRUE ✓" : "false"}`
        );

        evaluatedRules.push({ rule: conditionStr, result });

        if (result === true) {
          // First matching rule wins
          return { matchedRule: rule, evaluatedRules, error: null };
        }
      } catch (err) {
        console.warn(`[RuleEngine] Error on rule #${rule.id}:`, err.message);
        evaluationError = err.message;
        evaluatedRules.push({ rule: conditionStr, result: false, error: err.message });
      }
    }

    // No conditional rule matched — fall back to DEFAULT
    if (defaultRule) {
      console.log(`[RuleEngine] No rule matched. Using DEFAULT rule #${defaultRule.id}.`);
      evaluatedRules.push({ rule: "DEFAULT", result: true });
      return { matchedRule: defaultRule, evaluatedRules, error: evaluationError };
    }

    console.log("[RuleEngine] No rule matched and no DEFAULT rule found.");
    return { matchedRule: null, evaluatedRules, error: evaluationError };
  }
}

module.exports = new RuleEngine();