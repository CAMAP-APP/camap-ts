import CircularProgressBox from '@components/utils/CircularProgressBox';
import { useGetVendorProfessionsQuery, useUpdateVendorMutation, useVendorQuery, Vendor } from '@gql';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

interface VendorFormProps {
  vendorId: Vendor["id"];
  onSuccess?: () => void;
}

interface VendorFormData {
  name: string;
  email: string;
  showEmail: boolean;
  city: string;
  address1?: string;
  address2?: string;
  zipCode: string;
  phone?: string;
  showPhone: boolean;
  linkText?: string;
  desc?: string;
  linkUrl?: string;
  country?: string;
  longDesc?: string;
  companyNumber: string;
  profession?: number | null;
  production2?: number | null;
  production3?: number | null;
  peopleName?: string;
  lat?: number | null,
  lng?: number | null
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  showEmail: yup.boolean(),
  city: yup.string().required('City is required'),
  address1: yup.string(),
  address2: yup.string(),
  zipCode: yup.string().required('Zip code is required'),
  phone: yup.string(),
  showPhone: yup.boolean(),
  linkText: yup.string(),
  desc: yup.string().max(1000, 'Description must be less than 1000 characters'),
  linkUrl: yup.string().url('Invalid URL'),
  country: yup.string(),
  longDesc: yup.string(),
  companyNumber: yup.string().required('Company Number is required'),
  profession: yup.number().nullable(),
  production2: yup.number().nullable(),
  production3: yup.number().nullable(),
  peopleName: yup.string(),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
});

const countries = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'UK', name: 'United Kingdom' },
];

const VendorForm: React.FC<VendorFormProps> = ({ vendorId, onSuccess }) => {
  const { tVendorDash } = useCamapTranslation({ tVendorDash: 'vendorDashboard' });
  
  const [updateVendor, { loading: updateLoading, error: updateError }] = useUpdateVendorMutation();
  const { data: professionsData, loading: professionsLoading, error: professionsError } = useGetVendorProfessionsQuery();
  const { data: vendorData, loading: vendorLoading, error: vendorError } = useVendorQuery({
    variables: { id: vendorId },
    skip: !vendorId,
  });

  const vendor = vendorData?.vendor;

  const initialValues: VendorFormData = {
    name: vendor?.name || '',
    email: vendor?.email || '',
    showEmail: vendor?.showEmail ?? true,
    city: vendor?.city || '',
    address1: vendor?.address1 || '',
    address2: vendor?.address2 || '',
    zipCode: vendor?.zipCode || '',
    phone: vendor?.phone || '',
    showPhone: vendor?.showPhone ?? true,
    linkText: vendor?.linkText || '',
    desc: vendor?.desc || '',
    linkUrl: vendor?.linkUrl || '',
    country: vendor?.country || 'FR',
    longDesc: vendor?.longDesc || '',
    companyNumber: vendor?.companyNumber || '',
    profession: vendor?.profession || null,
    production2: vendor?.production2 || null,
    production3: vendor?.production3 || null,
    peopleName: vendor?.peopleName || '',
    lat: vendor?.lat || null,
    lng: vendor?.lng || null,
  };

  const onSubmit = async (values: VendorFormData) => {
    try {
      await updateVendor({
        variables: {
          vendorId,
          ...values,
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const professions = professionsData?.getVendorProfessions || [];

  // Handle loading states
  if (vendorLoading || professionsLoading) {
    return (
      <Paper>
        <CircularProgressBox />
      </Paper>
    );
  }

  // Handle error states
  const error = vendorError || professionsError;
  if (error) {
    console.error(error);
    return (
      <Paper>
        <Alert severity="error">
          {tVendorDash('errorLoadingVendor')}: {error.message}
        </Alert>
      </Paper>
    );
  }

  if (!vendor) {
    return (
      <Paper>
        <Alert severity="warning">
          {tVendorDash('vendorNotFound')}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ maxWidth: 1000, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {tVendorDash('editVendorProfile')}
      </Typography>
      
      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError.message}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting, dirty, resetForm }) => (
          <Form>
            <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {tVendorDash('basicInformation')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="name">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('vendorName')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                  required
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="peopleName">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('contactPerson')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="email">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('email')}
                  type="email"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                  required
                />
              )}
            </Field>
            <Field name="showEmail">
              {({ field, meta }: any) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      name={field.name}
                    />
                  }
                  label={tVendorDash('showEmail')}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="phone">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('phone')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
            <Field name="showPhone">
              {({ field, meta }: any) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      name={field.name}
                    />
                  }
                  label={tVendorDash('showPhone')}
                />
              )}
            </Field>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {tVendorDash('address')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Field name="address1">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('address1')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12}>
            <Field name="address2">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('address2')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="zipCode">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('zipCode')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                  required
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="city">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('city')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                  required
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="country">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <InputLabel>{tVendorDash('country')}</InputLabel>
                  <Select {...field} label={tVendorDash('country')}>
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid>

          {/* Map */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {tVendorDash('mapPoint')}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Field name="lat">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <TextField
                    {...field}
                    label={tVendorDash('lat')}
                    fullWidth
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                  />
                </FormControl>
              )}
            </Field>
          </Grid>

          <Grid item xs={6}>
            <Field name="lng">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <TextField
                    {...field}
                    label={tVendorDash('lng')}
                    fullWidth
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                  />
                </FormControl>
              )}
            </Field>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {tVendorDash('professionalInformation')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Field name="companyNumber">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                <TextField
                  {...field}
                  label={tVendorDash('companyNumber')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                  required
                />
              </FormControl>
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="profession">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <InputLabel>{tVendorDash('profession')}</InputLabel>
                  <Select {...field} value={field.value || ''} label={tVendorDash('profession')}>
                    <MenuItem value="">
                      <em>{tVendorDash('selectProfession')}</em>
                    </MenuItem>
                    {professions.map((profession: { id: number; name: string }) => (
                      <MenuItem key={profession.id} value={profession.id}>
                        {profession.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="production2">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <InputLabel>{tVendorDash('profession2')}</InputLabel>
                  <Select {...field} value={field.value || ''} label={tVendorDash('profession2')}>
                    <MenuItem value="">
                      <em>{tVendorDash('selectProfession')}</em>
                    </MenuItem>
                    {professions.map((profession: { id: number; name: string }) => (
                      <MenuItem key={profession.id} value={profession.id}>
                        {profession.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Field name="production3">
              {({ field, meta }: any) => (
                <FormControl fullWidth error={meta.touched && !!meta.error}>
                  <InputLabel>{tVendorDash('profession3')}</InputLabel>
                  <Select {...field} value={field.value || ''} label={tVendorDash('profession3')}>
                    <MenuItem value="">
                      <em>{tVendorDash('selectProfession')}</em>
                    </MenuItem>
                    {professions.map((profession: { id: number; name: string }) => (
                      <MenuItem key={profession.id} value={profession.id}>
                        {profession.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {tVendorDash('description')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Field name="desc">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('shortDescription')}
                  multiline
                  rows={3}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : `${(field.value as string)?.length || 0}/1000`}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12}>
            <Field name="longDesc">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('longDescription')}
                  multiline
                  rows={5}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          {/* Links */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {tVendorDash('links')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="linkText">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('linkText')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Field name="linkUrl">
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  label={tVendorDash('linkUrl')}
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error ? meta.error : ''}
                />
              )}
            </Field>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={updateLoading || isSubmitting || !dirty}
              >
                {updateLoading || isSubmitting ? <CircularProgress size={20} /> : tVendorDash('saveChanges')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => resetForm()}
                disabled={!dirty}
              >
                {tVendorDash('reset')}
              </Button>
            </Box>
          </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default VendorForm;
