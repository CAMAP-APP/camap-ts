import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { useGetVendorProfessionsQuery, useUpdateVendorMutation, useVendorQuery, Vendor } from '@gql';

interface VendorFormProps {
  vendorId: Vendor["id"];
  onSuccess?: () => void;
}

interface VendorFormData {
  name: string;
  email: string;
  city: string;
  address1?: string;
  address2?: string;
  zipCode: string;
  phone?: string;
  linkText?: string;
  desc?: string;
  linkUrl?: string;
  country?: string;
  longDesc?: string;
  profession?: number | null;
  production2?: number | null;
  production3?: number | null;
  peopleName?: string;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  city: yup.string().required('City is required'),
  address1: yup.string(),
  address2: yup.string(),
  zipCode: yup.string().required('Zip code is required'),
  phone: yup.string(),
  linkText: yup.string(),
  desc: yup.string().max(1000, 'Description must be less than 1000 characters'),
  linkUrl: yup.string().url('Invalid URL'),
  country: yup.string(),
  longDesc: yup.string(),
  profession: yup.number().nullable(),
  production2: yup.number().nullable(),
  production3: yup.number().nullable(),
  peopleName: yup.string(),
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
  const { data: professionsData, loading: professionsLoading } = useGetVendorProfessionsQuery();
  const { data: vendorData, loading: vendorLoading, error: vendorError } = useVendorQuery({
    variables: { id: vendorId },
    skip: !vendorId,
  });

  const vendor = vendorData?.vendor;

  const initialValues: VendorFormData = {
    name: vendor?.name || '',
    email: vendor?.email || '',
    city: vendor?.city || '',
    address1: vendor?.address1 || '',
    address2: vendor?.address2 || '',
    zipCode: vendor?.zipCode || '',
    phone: vendor?.phone || '',
    linkText: vendor?.linkText || '',
    desc: vendor?.desc || '',
    linkUrl: vendor?.linkUrl || '',
    country: vendor?.country || 'FR',
    longDesc: vendor?.longDesc || '',
    profession: vendor?.profession || null,
    production2: vendor?.production2 || null,
    production3: vendor?.production3 || null,
    peopleName: vendor?.peopleName || '',
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
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle error states
  if (vendorError) {
    console.error(vendorError);
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            {tVendorDash('errorLoadingVendor')}: {vendorError.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!vendor) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            {tVendorDash('vendorNotFound')}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
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
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {tVendorDash('address')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
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

            {/* Professional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {tVendorDash('professionalInformation')}
              </Typography>
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
      </CardContent>
    </Card>
  );
};

export default VendorForm;
