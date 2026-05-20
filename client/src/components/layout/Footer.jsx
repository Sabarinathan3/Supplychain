import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Inventory2,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Demo', path: '/demo' },
      { label: 'Updates', path: '/updates' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' },
      { label: 'Contact', path: '/contact' },
    ],
    resources: [
      { label: 'Documentation', path: '/docs' },
      { label: 'API Reference', path: '/api' },
      { label: 'Support', path: '/support' },
      { label: 'Community', path: '/community' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'License', path: '/license' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Instagram />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <GitHub />, url: 'https://github.com', label: 'GitHub' },
  ];

  const contactInfo = [
    {
      icon: <Email />,
      text: 'support@supplychain.com',
      link: 'mailto:support@supplychain.com',
    },
    {
      icon: <Phone />,
      text: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: <LocationOn />,
      text: '123 Business St, City, State 12345',
      link: null,
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Inventory2 sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  SupplyChain Pro
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enterprise Supply Chain Management System. Streamline your inventory,
                orders, and warehouse operations with our comprehensive solution.
              </Typography>

              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                color="primary"
              >
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.product.map((link, index) => (
                  <Link
                    key={index}
                    component="button"
                    variant="body2"
                    color="text.secondary"
                    onClick={() => navigate(link.path)}
                    sx={{
                      textAlign: 'left',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                color="primary"
              >
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.company.map((link, index) => (
                  <Link
                    key={index}
                    component="button"
                    variant="body2"
                    color="text.secondary"
                    onClick={() => navigate(link.path)}
                    sx={{
                      textAlign: 'left',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                color="primary"
              >
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.resources.map((link, index) => (
                  <Link
                    key={index}
                    component="button"
                    variant="body2"
                    color="text.secondary"
                    onClick={() => navigate(link.path)}
                    sx={{
                      textAlign: 'left',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                color="primary"
              >
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.legal.map((link, index) => (
                  <Link
                    key={index}
                    component="button"
                    variant="body2"
                    color="text.secondary"
                    onClick={() => navigate(link.path)}
                    sx={{
                      textAlign: 'left',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Contact Info Section */}
        <Box sx={{ py: 3 }}>
          <Grid container spacing={2}>
            {contactInfo.map((contact, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {contact.icon}
                  </Box>
                  {contact.link ? (
                    <Link
                      href={contact.link}
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'none' }}
                    >
                      {contact.text}
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {contact.text}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Bottom Footer */}
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} SupplyChain Pro. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Version 1.0.0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Link
              href="#"
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: 'none' }}
            >
              Status
            </Link>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Link
              href="#"
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: 'none' }}
            >
              Changelog
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
