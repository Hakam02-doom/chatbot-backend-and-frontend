import express from 'express';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Server</title>
    </head>
    <body>
      <h1>Server is working!</h1>
      <p>If you can see this, the server is running correctly.</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
