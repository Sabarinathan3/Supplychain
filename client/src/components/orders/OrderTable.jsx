import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Toolbar,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Person,
  Warehouse,
  ShoppingCart,
  CheckCircle,
  Cancel,
  Schedule,
  LocalShipping,
  Print,
  Download,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from 'react-router-dom';

const headCells = [
  { id: 'orderNumber', label: 'Order #', sortable: true },
  { id: 'customer', label: 'Customer', sortable: true },
  { id: 'warehouse', label: 'Warehouse', sortable: true },
  { id: 'items', label: 'Items', sortable: true, align: 'center' },
  { id: 'totalAmount', label: 'Total Amount', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'orderDate', label: 'Order Date', sortable: true },
  { id: 'deliveryDate', label: 'Delivery Date', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false, align: 'right' },
];

const OrderTable = ({
  orders = [],
  onEdit,
  onDelete,
  onView,
  loading,
  onSelectionChange,
}) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('orderNumber');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = orders.map((n) => n.id);
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
      return;
    }
    setSelected([]);
    onSelectionChange?.([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, order) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleMenuAction = (action) => {
    if (selectedOrder) {
      switch (action) {
        case 'view':
          navigate(`/orders/${selectedOrder.id}`);
          break;
        case 'edit':
          onEdit?.(selectedOrder);
          break;
        case 'delete':
          onDelete?.(selectedOrder);
          break;
        case 'print':
          window.print();
          break;
        case 'download':
          // Implement download logic
          console.log('Download order:', selectedOrder);
          break;
        default:
          break;
      }
    }
    handleMenuClose();
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'warning', icon: <Schedule />, label: 'Pending' },
      CONFIRMED: { color: 'info', icon: <CheckCircle />, label: 'Confirmed' },
      PROCESSING: { color: 'primary', icon: <ShoppingCart />, label: 'Processing' },
      SHIPPED: { color: 'secondary', icon: <LocalShipping />, label: 'Shipped' },
      DELIVERED: { color: 'success', icon: <CheckCircle />, label: 'Delivered' },
      CANCELLED: { color: 'error', icon: <Cancel />, label: 'Cancelled' },
    };
    return configs[status] || configs.PENDING;
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.vendor?.name?.toLowerCase().includes(searchLower) ||
      order.warehouse?.name?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue, bValue;

    switch (orderBy) {
      case 'orderNumber':
        aValue = a.orderNumber || '';
        bValue = b.orderNumber || '';
        break;
      case 'customer':
        aValue = a.vendor?.name || '';
        bValue = b.vendor?.name || '';
        break;
      case 'warehouse':
        aValue = a.warehouse?.name || '';
        bValue = b.warehouse?.name || '';
        break;
      case 'items':
        aValue = a.items?.length || 0;
        bValue = b.items?.length || 0;
        break;
      case 'totalAmount':
        aValue = parseFloat(a.totalAmount || 0);
        bValue = parseFloat(b.totalAmount || 0);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'orderDate':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      case 'deliveryDate':
        aValue = new Date(a.deliveryDate || 0);
        bValue = new Date(b.deliveryDate || 0);
        break;
      default:
        return 0;
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
        ) : (
          <TextField
            placeholder="Search orders..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: '1 1 100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        )}

        {selected.length > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={() => console.log('Delete selected:', selected)}>
              <Delete />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <FilterList />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 && selected.length < orders.length
                  }
                  checked={orders.length > 0 && selected.length === orders.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <ShoppingCart sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const isItemSelected = isSelected(order.id);
                const statusConfig = getStatusConfig(order.status);
                const totalAmount = order.totalAmount ||
                  order.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, order.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={order.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>

                    {/* Order Number */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <ShoppingCart fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                          #{order.orderNumber}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {order.vendor?.name || 'N/A'}
                          </Typography>
                          {order.vendor?.email && (
                            <Typography variant="caption" color="text.secondary">
                              {order.vendor.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Warehouse */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warehouse fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">{order.warehouse?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.warehouse?.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Items Count */}
                    <TableCell align="center">
                      <Chip
                        label={order.items?.length || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        ${parseFloat(totalAmount).toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                      />
                    </TableCell>

                    {/* Order Date */}
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>

                    {/* Delivery Date */}
                    <TableCell>
                      {order.deliveryDate ? (
                        <Typography variant="body2">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Not set
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Order</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Order</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('download')}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Order</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderTable;
