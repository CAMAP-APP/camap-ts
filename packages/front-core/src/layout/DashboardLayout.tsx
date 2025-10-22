import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography,
  } from '@mui/material';
  import { Link, useLocation, Outlet } from 'react-router-dom';
  import { ReactNode } from 'react';
  
  interface NavigationItem {
    path: string;
    icon: ReactNode;
    label: string;
  }
  
  const DashboardLayout = (props: {
    home: NavigationItem
    navigation?: NavigationItem[]
  }) => {
    const location = useLocation();
  
    return (
      <>
        <Box sx={{ 
          display: 'flex',
          minHeight: '50vh',
          marginBottom: '12px'
        }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: 300,
              minHeight: '100%',
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Paper elevation={0} sx={{ height: '100%' }}>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" component="div">
                  <Link
                    to={props.home.path}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {props.home.icon}
                    {props.home.label}
                  </Link>
                </Typography>
              </Box>
  
              {/* Navigation */}
              <List sx={{ p: 1 }}>
                {props.navigation?.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'warning.light',
                          color: 'warning.contrastText',
                          '&:hover': {
                            bgcolor: 'warning.main',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
  
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: 1 }}>  
            <Outlet />
          </Box>
        </Box>
      </>
    );
  };
  
  export default DashboardLayout;
  