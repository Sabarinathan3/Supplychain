import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Inventory2,
} from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authService.login(formData);
      dispatch(loginSuccess(response));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed'));
    }
  };

  // Quick login helper
  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@company.com', password: 'Admin@123' },
      manager: { email: 'manager@company.com', password: 'Manager@123' },
      vendor: { email: 'vendor@company.com', password: 'Vendor@123' },
      viewer: { email: 'viewer@company.com', password: 'Viewer@123' },
    };
    setFormData(credentials[role]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        padding: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            maxWidth: 450,
            width: '100%',
            boxShadow: theme.shadows[8],
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                }}
              >
                <Inventory2 sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your SupplyChain account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  mb: 2,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Login Buttons */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1, textAlign: 'center' }}
              >
                Quick Login (Demo)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                }}
              >
                {['admin', 'manager', 'vendor', 'viewer'].map((role) => (
                  <Button
                    key={role}
                    size="small"
                    variant="outlined"
                    onClick={() => quickLogin(role)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {role}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Footer */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 3, textAlign: 'center' }}
            >
              © 2026 SupplyChain Pro. All rights reserved.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
