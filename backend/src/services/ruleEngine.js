/**
 * Service to evaluate rules against input data
 */
class RuleEngine {
  /**
   * Evaluate a list of rules and return the matched rule object (first match)
   */
  evaluate(rules, data) {
    console.log(`Evaluating ${rules.length} rules...`);
    
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    let evaluationError = null;

    for (const rule of sortedRules) {
      try {
        const isMatched = this.checkCondition(rule.condition, data);
        console.log(`Rule ${rule.id} (priority ${rule.priority}): ${rule.condition} -> ${isMatched ? "MATCHED" : "NOT MATCHED"}`);
        
        if (isMatched) {
          return { matchedRule: rule, error: evaluationError };
        }
      } catch (err) {
        console.warn(`Error evaluating rule ${rule.id}:`, err.message);
        evaluationError = err.message;
        // Continue to other rules if one fails
      }
    }

    console.log("No rules matched. Returning null.");
    return { matchedRule: null, error: evaluationError };
  }

  /**
   * Evaluate a single condition string against data
   */
  checkCondition(condition, data) {
    if (!condition || condition === "true" || condition.trim() === "" || condition.toUpperCase() === "DEFAULT") return true;

    let evalString = condition;

    // Support for functions
    evalString = evalString.replace(/contains\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (match, field, val) => {
      return `(${field}).includes(${JSON.stringify(val.trim())})`;
    });

    evalString = evalString.replace(/startsWith\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (match, field, val) => {
      return `(${field}).startsWith(${JSON.stringify(val.trim())})`;
    });

    evalString = evalString.replace(/endsWith\(([^,]+),\s*['"]?([^'"]+)['"]?\)/g, (match, field, val) => {
      return `(${field}).endsWith(${JSON.stringify(val.trim())})`;
    });

    try {
      // 1. Try strict evaluation first
      const result = new Function("data", `return (${evalString})`)(data);
      if (result) return true;

      // 2. If strict fails, try case-insensitive fallback for string comparisons
      const lowerData = {};
      Object.keys(data).forEach(key => {
        lowerData[key] = typeof data[key] === 'string' ? data[key].toLowerCase() : data[key];
      });
      const lowerEval = evalString.toLowerCase();
      const fallbackResult = new Function("data", `return (${lowerEval})`)(lowerData);
      return !!fallbackResult;
    } catch (error) {
      // Fallback: legacy support for keys without 'data.' prefix
      try {
        // 1. Try strict legacy replacement
        const result = this.evaluateLegacy(evalString, data);
        if (result) return true;

        // 2. Try case-insensitive legacy replacement
        const lowerData = {};
        Object.keys(data).forEach(key => {
          lowerData[key] = typeof data[key] === 'string' ? data[key].toLowerCase() : data[key];
        });
        const lowerEval = evalString.toLowerCase();
        return this.evaluateLegacy(lowerEval, lowerData);
      } catch (fallbackError) {
        throw new Error(`Invalid condition: "${condition}". Error: ${error.message}`);
      }
    }
  }

  evaluateLegacy(evalString, data) {
    let finalEval = evalString;
    Object.keys(data).forEach(key => {
      const val = data[key];
      const replacement = typeof val === 'string' ? JSON.stringify(val) : val;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      finalEval = finalEval.replace(regex, replacement);
    });
    return !!new Function(`return (${finalEval})`)();
  }
}

module.exports = new RuleEngine();