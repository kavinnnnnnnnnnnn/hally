async function runVerification() {
  const baseUrl = 'http://localhost:5001/api';
  const results = {};

  try {
    console.log('--- Phase 1: Health Check ---');
    results.phase1 = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log(JSON.stringify(results.phase1, null, 2));

    console.log('\n--- Phase 2: Create Test Workflow ---');
    results.phase2 = await fetch(`${baseUrl}/test/create-workflow`, { method: 'POST' }).then(r => r.json());
    console.log(JSON.stringify(results.phase2, null, 2));
    const workflowId = results.phase2.id;

    console.log('\n--- Phase 3: Create Workflow Steps ---');
    results.phase3 = await fetch(`${baseUrl}/test/create-steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: workflowId })
    }).then(r => r.json());
    console.log(JSON.stringify(results.phase3, null, 2));
    const startStepId = results.phase3.find(s => s.name === 'Manager Approval').id;

    console.log('\n--- Phase 4: Create Rules ---');
    results.phase4 = await fetch(`${baseUrl}/test/create-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step_id: startStepId })
    }).then(r => r.json());
    console.log(JSON.stringify(results.phase4, null, 2));

    console.log('\n--- Phase 5/8: Execute Test Case 1 (US High Priority) ---');
    results.testCase1 = await fetch(`${baseUrl}/test/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 250, country: 'US', priority: 'High' })
    }).then(r => r.json());
    console.log(JSON.stringify(results.testCase1, null, 2));

    console.log('\n--- Phase 5/8: Execute Test Case 2 (Low Amount) ---');
    results.testCase2 = await fetch(`${baseUrl}/test/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50, country: 'US', priority: 'Low' })
    }).then(r => r.json());
    console.log(JSON.stringify(results.testCase2, null, 2));

    console.log('\n--- Phase 7: Database Status ---');
    results.phase7 = await fetch(`${baseUrl}/test/database-status`).then(r => r.json());
    console.log(JSON.stringify(results.phase7, null, 2));

    console.log('\n--- VERIFICATION COMPLETE ---');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

runVerification();
