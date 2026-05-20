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
} from '@mui/material';
import {
  MoreVert,
  Search,
  FilterList,
  Delete,
  Edit,
  Warehouse,
  Inventory as InventoryIcon,
  Warning,
  CheckCircle,
  TrendingDown,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

const headCells = [
  { id: 'product', label: 'Product', sortable: true },
  { id: 'sku', label: 'SKU', sortable: true },
  { id: 'warehouse', label: 'Warehouse', sortable: true },
  { id: 'quantity', label: 'Quantity', sortable: true, align: 'right' },
  { id: 'reorderLevel', label: 'Reorder Level', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'value', label: 'Value', sortable: true, align: 'right' },
  { id: 'updatedAt', label: 'Last Updated', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false, align: 'right' },
];

const InventoryTable = ({
  inventory = [],
  onMenuClick,
  loading,
  onSelectionChange,
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('product');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = inventory.map((n) => n.id);
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

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const getStockStatus = (item) => {
    const { quantity } = item;
    const reorderLevel = item.product?.reorderLevel || 0;

    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    }
    if (quantity <= reorderLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <TrendingDown /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
  };

  const filteredInventory = inventory.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(searchLower) ||
      item.product?.sku?.toLowerCase().includes(searchLower) ||
      item.warehouse?.name?.toLowerCase().includes(searchLower)
    );
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let aValue, bValue;

    switch (orderBy) {
      case 'product':
        aValue = a.product?.name || '';
        bValue = b.product?.name || '';
        break;
      case 'sku':
        aValue = a.product?.sku || '';
        bValue = b.product?.sku || '';
        break;
      case 'warehouse':
        aValue = a.warehouse?.name || '';
        bValue = b.warehouse?.name || '';
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case 'reorderLevel':
        aValue = a.product?.reorderLevel || 0;
        bValue = b.product?.reorderLevel || 0;
        break;
      case 'value':
        aValue = a.quantity * parseFloat(a.product?.unitPrice || 0);
        bValue = b.quantity * parseFloat(b.product?.unitPrice || 0);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
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

  const paginatedInventory = sortedInventory.slice(
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
            placeholder="Search inventory..."
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
            <IconButton>
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
                    selected.length > 0 && selected.length < inventory.length
                  }
                  checked={inventory.length > 0 && selected.length === inventory.length}
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
            ) : paginatedInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No inventory found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInventory.map((item) => {
                const isItemSelected = isSelected(item.id);
                const stockStatus = getStockStatus(item);
                const value = item.quantity * parseFloat(item.product?.unitPrice || 0);

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, item.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={item.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {item.product?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.product?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product?.category}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {item.product?.sku}
                      </Typography>
                    </TableCell>

                    {/* Warehouse */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warehouse fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">{item.warehouse?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.warehouse?.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell align="right">
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={stockStatus.color + '.main'}
                      >
                        {item.quantity}
                      </Typography>
                    </TableCell>

                    {/* Reorder Level */}
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {item.product?.reorderLevel}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        icon={stockStatus.icon}
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>

                    {/* Value */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        ${value.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Last Updated */}
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMenuClick(e, item);
                        }}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredInventory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default InventoryTable;
