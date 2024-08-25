import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 250,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
      }}
      role="presentation"
    >
      {/* Close Button */}
      <IconButton
        onClick={toggleDrawer(false)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <Divider sx={{ marginTop: 4 }} />
      {/* Add other content above the Divider if needed */}
      
      {/* Text field and send icon at the bottom */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: 2,
          paddingBottom: 3,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          sx={{ marginRight: 1 }}
        />
        <IconButton color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <div>
      {/* Chat Button positioned at the bottom right */}
      <Button
        onClick={toggleDrawer(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#64748B',
          color: 'white',
          '&:hover': {
            backgroundColor: '#475569',
          },
        }}
      >
        Chat
      </Button>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
