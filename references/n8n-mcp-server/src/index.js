const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const PORT = process.env.MCP_SERVER_PORT || 3002;

console.log('Starting N8N MCP Server with configuration:');
console.log('N8N_BASE_URL:', N8N_BASE_URL);
console.log('PORT:', PORT);

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// 健康检查端点
app.get('/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ status: 'ok' });
});

// 获取所有工作流
app.get('/workflows', async (req, res) => {
  console.log('Fetching workflows from N8N...');
  try {
    const response = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });
    console.log('Successfully fetched workflows');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching workflows:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to fetch workflows', details: error.message });
  }
});

// 执行特定工作流
app.post('/workflows/:id/execute', async (req, res) => {
  const { id } = req.params;
  console.log(`Executing workflow ${id}...`);
  try {
    const response = await axios.post(
      `${N8N_BASE_URL}/api/v1/workflows/${id}/execute`,
      req.body,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY
        }
      }
    );
    console.log(`Successfully executed workflow ${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error executing workflow ${id}:`, error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to execute workflow', details: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`N8N MCP Server running on port ${PORT}`);
  console.log(`Connected to N8N at ${N8N_BASE_URL}`);
  
  // 测试与N8N的连接
  axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY
    }
  })
  .then(() => {
    console.log('Successfully connected to N8N API');
  })
  .catch((error) => {
    console.error('Failed to connect to N8N API:', error.message);
    console.error('Full error:', error);
  });
});