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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const InventoryChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Inventory by Warehouse" />
        <CardContent>
          <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Inventory by Warehouse"
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="warehouse" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8" name="Current Stock" />
            <Bar dataKey="capacity" fill="#82ca9d" name="Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default InventoryChart;
