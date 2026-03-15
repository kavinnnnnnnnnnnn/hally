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

    for (const rule of sortedRules) {
      const isMatched = this.checkCondition(rule.condition, data);
      console.log(`Rule ${rule.id} (priority ${rule.priority}): ${rule.condition} -> ${isMatched ? "MATCHED" : "NOT MATCHED"}`);
      
      if (isMatched) {
        return rule;
      }
    }

    console.log("No rules matched. Returning null.");
    return null;
  }

  /**
   * Evaluate a single condition string against data
   */
  checkCondition(condition, data) {
    if (!condition || condition === "true" || condition.trim() === "" || condition.toUpperCase() === "DEFAULT") return true;

    let evalString = condition;

    // Support for functions: contains(field, value), startsWith(field, prefix), endsWith(field, suffix)
    // We assume these are written as contains(data.field, 'value') or similar if using the data. prefix
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
      // Evaluate the expression with 'data' as a local variable
      // Using 'new Function' with 'data' available in the scope
      const result = new Function("data", `return (${evalString})`)(data);
      return !!result;
    } catch (error) {
      console.warn(`Condition evaluation failure: "${evalString}"`, error.message);
      
      // Fallback: if 'data.' wasn't used, try replacing keys (legacy support)
      try {
        let fallbackEval = evalString;
        Object.keys(data).forEach(key => {
          const val = data[key];
          const replacement = typeof val === 'string' ? JSON.stringify(val) : val;
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          fallbackEval = fallbackEval.replace(regex, replacement);
        });
        const fallbackResult = new Function(`return (${fallbackEval})`)();
        return !!fallbackResult;
      } catch (fallbackError) {
        return false;
      }
    }
  }
}

module.exports = new RuleEngine();