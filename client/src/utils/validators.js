import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

// Register validation schema
export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Product validation schema
export const productSchema = yup.object().shape({
  sku: yup
    .string()
    .matches(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')
    .required('SKU is required'),
  name: yup
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  category: yup.string().required('Category is required'),
  unitPrice: yup
    .number()
    .positive('Unit price must be positive')
    .required('Unit price is required'),
  reorderLevel: yup
    .number()
    .integer('Reorder level must be an integer')
    .min(0, 'Reorder level cannot be negative')
    .required('Reorder level is required'),
});

// Warehouse validation schema
export const warehouseSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Warehouse name must be at least 3 characters')
    .required('Warehouse name is required'),
  location: yup.string().required('Location is required'),
  capacity: yup
    .number()
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer')
    .required('Capacity is required'),
  address: yup.string(),
  contactPerson: yup.string(),
  contactPhone: yup
    .string()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  contactEmail: yup.string().email('Invalid email address'),
});

// Vendor validation schema
export const vendorSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Vendor name must be at least 3 characters')
    .required('Vendor name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number')
    .required('Phone is required'),
  address: yup.string(),
  contactPerson: yup.string(),
  website: yup.string().url('Invalid URL'),
  taxId: yup.string(),
});

// Inventory validation schema
export const inventorySchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  warehouseId: yup.string().required('Warehouse is required'),
  quantity: yup
    .number()
    .integer('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
  notes: yup.string(),
});

// Transfer validation schema
export const transferSchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  fromWarehouseId: yup.string().required('Source warehouse is required'),
  toWarehouseId: yup
    .string()
    .required('Destination warehouse is required')
    .notOneOf([yup.ref('fromWarehouseId')], 'Source and destination must be different'),
  quantity: yup
    .number()
    .integer('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
  notes: yup.string(),
});

// Change password validation schema
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .notOneOf([yup.ref('currentPassword')], 'New password must be different')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default {
  loginSchema,
  registerSchema,
  productSchema,
  warehouseSchema,
  vendorSchema,
  inventorySchema,
  transferSchema,
  changePasswordSchema,
};
