/* eslint-disable import/no-extraneous-dependencies */
import {
  Alert,
  Box,
  Button,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import CamapLink from '../src/components/utils/CamapLink';

export const CssDebug = () => {
  return (
    <>
      {/* Camap CSS */}
      <link
        rel="stylesheet"
        type="text/css"
        href="http://localhost/css/29/style.css"
      />

      {/* BOOTSTRAP */}
      <link rel="stylesheet" href="http://localhost/css/29/bootstrap.min.css" />

      <Grid container spacing={1} direction="column">
        <Grid item>
          <Alert severity="success">Tudo bem</Alert>
        </Grid>
        <Grid item>
          <Alert severity="error">Hou là là !</Alert>
        </Grid>
        <Grid item>
          <Alert severity="warning">Une info</Alert>
        </Grid>
        <Grid item>
          <Alert severity="info">Une info</Alert>
        </Grid>
      </Grid>
      <Box bgcolor="white" mt={2} p={2}>
        <Grid container>
          <Grid item container md={6}>
            <Grid item>
              <Button variant="contained">Primary</Button>
              <Button variant="contained" disabled>
                Disabled
              </Button>
              <CamapLink href="#">Camap Link</CamapLink>
            </Grid>
            <Grid item>
              <Button variant="outlined">Primary</Button>
              <Button variant="outlined" disabled>
                Disabled
              </Button>
            </Grid>
            <Grid item>
              <Tooltip title="Tooltip text lorem ipsum" arrow>
                <Button>Tooltip</Button>
              </Tooltip>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <Typography variant="h1" gutterBottom>
              h1. Heading
            </Typography>
            <Typography variant="h2" gutterBottom>
              h2. Heading
            </Typography>
            <Typography variant="h3" gutterBottom>
              h3. Heading
            </Typography>
            <Typography variant="h4" gutterBottom>
              h4. Heading
            </Typography>
            <Typography variant="h5" gutterBottom>
              h5. Heading
            </Typography>
            <Typography variant="h6" gutterBottom>
              h6. Heading
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="body1" gutterBottom>
              body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="body2" gutterBottom>
              body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="button" display="block" gutterBottom>
              button text
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              caption text
            </Typography>
            <Typography variant="overline" display="block" gutterBottom>
              overline text
            </Typography>
          </Grid>
          <Grid item container md={12} spacing={2}>
            <Grid item>
              <TextField label="Text field"></TextField>
            </Grid>
            <Grid item>
              <TextField hiddenLabel>No label</TextField>
            </Grid>
            <Grid item>
              <TextField
                multiline
                rows={4}
                label="Multiline text field"
              ></TextField>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default {
  title: 'CssDebug',
};
