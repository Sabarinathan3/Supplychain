import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Inventory, ShoppingCart, LocalShipping } from '@mui/icons-material';
import StatsCard from '../components/common/StatsCard';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch analytics data
  const { data: inventoryAnalytics, isLoading: inventoryLoading } = useQuery({
    queryKey: ['analytics-inventory'],
    queryFn: async () => {
      const response = await api.get('/analytics/inventory');
      return response.data;
    },
  });

  const { data: orderAnalytics, isLoading: orderLoading } = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: async () => {
      const response = await api.get('/analytics/orders');
      return response.data;
    },
  });

  const { data: vendorAnalytics, isLoading: vendorLoading } = useQuery({
    queryKey: ['analytics-vendors'],
    queryFn: async () => {
      const response = await api.get('/analytics/vendors');
      return response.data;
    },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (inventoryLoading || orderLoading || vendorLoading) return <Loading />;

  // Transform data for charts
  const inventoryByWarehouse =
    inventoryAnalytics?.inventoryByWarehouse?.map((item) => ({
      name: item.warehouseName,
      stock: item.totalStock,
    })) || [];

  const inventoryByCategory =
    inventoryAnalytics?.inventoryByCategory?.map((item) => ({
      name: item.category,
      value: item._count.category,
    })) || [];

  const ordersByMonth = orderAnalytics?.ordersByMonth || [];
  const topVendors = vendorAnalytics?.topVendors || [];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into your supply chain
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="365">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Inventory Value"
            value="$1.2M"
            icon={<Inventory />}
            color="primary"
            trend="up"
            trendValue="+15%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Orders This Month"
            value="248"
            icon={<ShoppingCart />}
            color="success"
            trend="up"
            trendValue="+22%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Deliveries"
            value="189"
            icon={<LocalShipping />}
            color="info"
            trend="up"
            trendValue="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg. Fulfillment Time"
            value="2.4 days"
            icon={<TrendingUp />}
            color="warning"
            trend="down"
            trendValue="-12%"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Inventory" />
          <Tab label="Orders" />
          <Tab label="Vendors" />
        </Tabs>
      </Card>

      {/* Inventory Analytics */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Inventory by Warehouse
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Inventory by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Top Products by Stock Value
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {inventoryAnalytics?.topProducts?.slice(0, 5).map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.product?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.warehouse?.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={700}>
                          {item.quantity} units
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${(item.quantity * parseFloat(item.product?.unitPrice || 0)).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Orders Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Order Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={ordersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#1976d2"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2e7d32"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Vendors Analytics */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Top Vendors by Order Volume
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topVendors} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;
