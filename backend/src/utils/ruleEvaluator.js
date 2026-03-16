/**
 * Standalone rule evaluator utilities.
 * These mirror the RuleEngine service logic and can be used independently
 * for unit testing or embedded scripting.
 */

/**
 * Evaluate a single condition string against a data object.
 * Bare field names (e.g. `amount`, `country`) resolve directly from `data`
 * via the `with` statement — no `data.` prefix required.
 *
 * @param {string} condition - e.g. "amount > 100 && country == 'US'"
 * @param {Object} data      - e.g. { amount: 250, country: "US" }
 * @returns {boolean}
 *
 * @example
 * evaluateCondition("amount > 100 && country == 'US'", { amount: 250, country: "US" })
 * // → true
 *
 * evaluateCondition("amount > 100 && country == 'US'", { amount: 20, country: "US" })
 * // → false
 */
function evaluateCondition(condition, data) {
  try {
    const fn = new Function("data", `with(data) { return !!(${condition}); }`);
    return fn(data);
  } catch (error) {
    console.error("Rule evaluation error:", error.message);
    return false;
  }
}

/**
 * Select the next step ID by evaluating rules against the provided input data.
 *
 * Algorithm:
 *  1. Sort rules by priority ascending.
 *  2. Skip DEFAULT rules (save as fallback).
 *  3. Return next_step_id of the first matching rule.
 *  4. If nothing matches, return the DEFAULT rule's next_step_id.
 *  5. Return null if no DEFAULT exists.
 *
 * @param {Array<{condition: string, next_step_id: any, priority: number}>} rules
 * @param {Object} inputData
 * @returns {any|null} next_step_id or null
 */
function selectNextStep(rules, inputData) {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  let defaultRule = null;

  for (const rule of sortedRules) {
    const conditionStr = (rule.condition || "").trim();

    if (conditionStr.toUpperCase() === "DEFAULT") {
      defaultRule = rule;
      continue;
    }

    const result = evaluateCondition(conditionStr, inputData);
    if (result === true) {
      return rule.next_step_id;
    }
  }

  if (defaultRule) {
    return defaultRule.next_step_id;
  }

  return null;
}

module.exports = { evaluateCondition, selectNextStep };
