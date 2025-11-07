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
  import { Link, useLocation, Outlet, NavLink } from 'react-router-dom';
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
          width: "100%",
          display: 'flex',
          minHeight: '50vh',
          marginBottom: '12px',
          flexFlow: {
            xs: 'column nowrap',
            sm: 'row nowrap'
          }
        }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: '160px',
              },
              minHeight: '100%',
              flexGrow: 0,
              flexShrink: 0,
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
              <List sx={{ p: 1 }} dense>
                {props.navigation?.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={item.path}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.selected': {
                          bgcolor: 'warning.light',
                          color: 'warning.contrastText',
                          '&:hover': {
                            bgcolor: 'warning.main',
                          },
                        },
                        '& .MuiListItemIcon-root': {
                          minWidth: 0,
                          marginRight: 1,
                        },
                      }}
                    >
                      <ListItemIcon >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
  
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, pl: 2, pr: 2 }}>  
            <Outlet />
          </Box>
        </Box>
      </>
    );
  };
  
  export default DashboardLayout;
  