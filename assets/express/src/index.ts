import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const port = 3000;
const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.get('/', function (_req, res) {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
