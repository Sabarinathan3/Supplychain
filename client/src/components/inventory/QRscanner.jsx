import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import QRScanner from '../components/common/QRScanner';

const Inventory = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [result, setResult] = useState('');

  console.log('Inventory rendered, scannerOpen:', scannerOpen);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory - QR Scanner Test
      </Typography>

      <Button 
        variant="contained" 
        size="large"
        onClick={() => {
          console.log('Button clicked!');
          setScannerOpen(true);
        }}
      >
        CLICK ME - Open Scanner
      </Button>

      {result && (
        <Typography sx={{ mt: 2 }}>
          Last scanned: {result}
        </Typography>
      )}

      <Typography sx={{ mt: 2 }}>
        Scanner Open State: {scannerOpen ? 'TRUE' : 'FALSE'}
      </Typography>

      <QRScanner
        open={scannerOpen}
        onClose={() => {
          console.log('Closing scanner');
          setScannerOpen(false);
        }}
        onScan={(text) => {
          console.log('Scanned:', text);
          setResult(text);
          setScannerOpen(false);
        }}
      />
    </Box>
  );
};

export default Inventory;
