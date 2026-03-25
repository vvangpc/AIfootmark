import express from "express";
import cors from "cors";

// 路由导入
import wishPlacesRouter from './routes/wishPlaces';
import footprintsRouter from './routes/footprints';
import statsRouter from './routes/stats';
import dataRouter from './routes/data';

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// 挂载路由
app.use('/api/v1/wish-places', wishPlacesRouter);
app.use('/api/v1/footprints', footprintsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1', dataRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

export default app;
