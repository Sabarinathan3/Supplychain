import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Inventory,
  Warehouse,
  ShoppingCart,
  LocalShipping,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import StatsCard from '../components/common/StatsCard';
import Loading from '../components/common/Loading';
import api from '../services/api';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const theme = useTheme();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
  });

  // Fetch low stock items
  const { data: lowStockData } = useQuery({
    queryKey: ['lowStock'],
    queryFn: async () => {
      const response = await api.get('/inventory/low-stock');
      return response.data;
    },
  });

  // Fetch recent orders
  const { data: ordersData } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const response = await api.get('/orders?limit=5');
      return response.data;
    },
  });

  if (isLoading) return <Loading />;

  const overview = dashboardData?.overview || {};
  const ordersByStatus = dashboardData?.ordersByStatus || {};
  const recentTransactions = dashboardData?.recentTransactions || [];

  // Chart configurations
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Inventory Value',
        data: [65000, 59000, 80000, 81000, 56000, overview.totalInventoryValue || 0],
        fill: true,
        backgroundColor: `${theme.palette.primary.main}20`,
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(ordersByStatus),
    datasets: [
      {
        data: Object.values(ordersByStatus),
        backgroundColor: [
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.success.main,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your inventory today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard
              title="Total Products"
              value={overview.totalProducts || 0}
              icon={<Inventory />}
              color="primary"
              trend="up"
              trendValue="+12%"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard
              title="Warehouses"
              value={overview.totalWarehouses || 0}
              icon={<Warehouse />}
              color="success"
              trend="up"
              trendValue="+5%"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard
              title="Total Orders"
              value={overview.totalOrders || 0}
              icon={<ShoppingCart />}
              color="info"
              trend="up"
              trendValue="+18%"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard
              title="Low Stock Items"
              value={overview.lowStockCount || 0}
              icon={<Warning />}
              color="warning"
              trend="down"
              trendValue="-8%"
            />
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Inventory Value Trend
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Status Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Orders by Status
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Low Stock Alerts
                </Typography>
                <Chip
                  label={`${lowStockData?.length || 0} items`}
                  color="warning"
                  size="small"
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Warehouse</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockData?.slice(0, 5).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.product?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.warehouse?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label="Low"
                            color="warning"
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Recent Orders
                </Typography>
                <Chip
                  label={`${ordersData?.pagination?.total || 0} total`}
                  color="primary"
                  size="small"
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordersData?.data?.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {order.vendor?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${order.totalAmount}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Activity
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentTransactions.slice(0, 5).map((transaction, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  borderBottom:
                    index !== recentTransactions.length - 1
                      ? '1px solid'
                      : 'none',
                  borderColor: 'divider',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: getTypeColor(transaction.type),
                    width: 40,
                    height: 40,
                  }}
                >
                  <TrendingUp fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {transaction.type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.inventory?.product?.name} -{' '}
                    {transaction.inventory?.warehouse?.name}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={transaction.quantity > 0 ? 'success.main' : 'error.main'}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {transaction.quantity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    SHIPPED: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'error',
  };
  return colors[status] || 'default';
};

const getTypeColor = (type) => {
  const colors = {
    STOCK_IN: '#4caf50',
    STOCK_OUT: '#f44336',
    ADJUSTMENT: '#ff9800',
    TRANSFER: '#2196f3',
  };
  return colors[type] || '#9e9e9e';
};

export default Dashboard;
