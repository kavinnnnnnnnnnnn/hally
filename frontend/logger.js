const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
app.post('/api/log-error', (req, res) => {
  console.log(">>> REACT CRASH ENCOUNTERED <<<");
  console.log(req.body.error);
  console.log(req.body.stack);
  res.send('ok');
  process.exit(0);
});
app.listen(5001, () => console.log('Logger listening on 5001... Waiting for user to refresh the page.'));
