import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  IconButton,
} from '@mui/material';
import {
  MoreVert,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  PENDING: '#ff9800',
  CONFIRMED: '#2196f3',
  PROCESSING: '#9c27b0',
  SHIPPED: '#673ab7',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
};

const OrderStatusChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Orders by Status" />
        <CardContent>
          <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status] || '#9e9e9e',
  }));

  return (
    <Card>
      <CardHeader
        title="Orders by Status"
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OrderStatusChart;
