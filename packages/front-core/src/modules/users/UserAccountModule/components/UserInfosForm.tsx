import ISO31661Selector from '@components/utils/ISO31661Selector';
import TwoColumnsGrid from '@components/utils/TwoColumnsGrid';
import { User } from '@gql';
import { Alert, Box, Button, TextField } from '@mui/material';
import { addressSchema, phoneSchema, userSchema } from 'camap-common';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { fieldToTextField } from 'formik-mui';
import DatePicker from '../../../../components/forms/Pickers/DatePicker';
import withHelperTextTranslation from '../../../../components/forms/shared/withHelperTextTranslation';
import ApolloErrorAlert from '../../../../components/utils/errors/ApolloErrorAlert';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';

export interface UserInfosFormProps {
  user?: UserInfosFormValues;
  onSubmit: (values: UserInfosFormValues, bag: UserInfosFormBag) => void;
  isPhoneRequired: boolean;
  isAddressRequired: boolean;
}

export type UserInfosFormValues = Pick<
  User,
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'birthDate'
  | 'nationality'
  | 'address1'
  | 'address2'
  | 'zipCode'
  | 'city'
  | 'countryOfResidence'
>;

export type UserInfosFormBag = FormikHelpers<UserInfosFormValues>;

const CustomTextField = withHelperTextTranslation(TextField, fieldToTextField);

const UserInfosForm = ({
  user,
  onSubmit,
  isPhoneRequired,
  isAddressRequired,
}: UserInfosFormProps) => {
  const { t, tBasics } = useCamapTranslation({
    tLogin: 'users/account',
    tBasics: 'translation',
  });
  const initialValues: UserInfosFormValues = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate,
    nationality: user?.nationality || 'fr',
    address1: user?.address1 || '',
    address2: user?.address2 || '',
    zipCode: user?.zipCode || '',
    city: user?.city || '',
    countryOfResidence: user?.countryOfResidence || 'fr',
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={(values) => {
        const errors = {};
        let validationSchema = userSchema;
        if (isPhoneRequired || !!values.phone) {
          validationSchema = validationSchema.concat(phoneSchema);
        }
        if (
          isAddressRequired ||
          values.zipCode ||
          values.address1 ||
          values.city
        ) {
          validationSchema = validationSchema.concat(addressSchema);
        }
        const fieldsToValidate = Object.keys(initialValues);
        fieldsToValidate.forEach((fieldToValidate) => {
          if (!(fieldToValidate in validationSchema.fields)) return;
          if (
            fieldToValidate === 'nationality' ||
            fieldToValidate === 'birthDate' ||
            fieldToValidate === 'countryOfResidence' ||
            fieldToValidate === 'address2'
          ) {
            return;
          }
          try {
            validationSchema.validateSyncAt(fieldToValidate, values);
          } catch (e) {
            errors[e.path] = e.message;
          }
        });
        return errors;
      }}
    >
      {({
        status,
        values,
        isSubmitting,
        touched,
        errors,
        setFieldValue,
        setFieldTouched,
      }) => (
        <Form>
          {status && status.apolloError && (
            <Box p={2} pb={0}>
              <ApolloErrorAlert error={status.apolloError} />
            </Box>
          )}

          {status && status.mailAlreadyInUseError && (
            <Box p={2} pb={0}>
              <Alert severity="error">{t('mailAlreadyInUseError')}</Alert>
            </Box>
          )}

          {status && status.success && (
            <Box p={2} pb={0}>
              <Alert severity="success">{t('updateSuccess')}</Alert>
            </Box>
          )}

          <Box p={2}>
            <TwoColumnsGrid
              left={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="firstName"
                  label={tBasics('firstName')}
                  component={CustomTextField}
                  required
                />
              }
              right={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="lastName"
                  label={tBasics('lastName')}
                  component={CustomTextField}
                  required
                />
              }
            />

            <TwoColumnsGrid
              left={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="email"
                  label={tBasics('email')}
                  type="email"
                  component={CustomTextField}
                  required
                />
              }
              right={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="phone"
                  label={tBasics('phone')}
                  component={CustomTextField}
                  required={isPhoneRequired}
                />
              }
            />

            <DatePicker
              inputFormat="dd MMMM yyyy"
              openTo="year"
              label={tBasics('birthDate')}
              value={values.birthDate}
              disabled={isSubmitting}
              onChange={(newDate: any) => {
                setFieldValue('birthDate', newDate);
              }}
              textFieldProps={{
                fullWidth: true,
              }}
            />

            <ISO31661Selector
              format="alpha2"
              autocompleteProps={{ disabled: isSubmitting }}
              textFieldProps={{
                fullWidth: true,
                margin: 'normal',
                required: false,
                name: 'nationality',
                label: tBasics('nationality'),
                error: Boolean(touched.nationality && errors.nationality),
                // helperText:
                //   touched.nationality && yupHelperTextTranslator(tYup, formikProps.errors.Address?.Country),
                onBlur: () => setFieldTouched('nationality'),
              }}
              defaultValue={
                initialValues.nationality?.toLocaleLowerCase() || ''
              }
              onChange={(v: string | null) => {
                setFieldTouched('nationality');
                setFieldValue('nationality', v?.toUpperCase() || '');
              }}
              value={values.nationality || ''}
            />
            <Field
              fullWidth
              margin="normal"
              variant="outlined"
              name="address1"
              label={tBasics('address1')}
              component={CustomTextField}
              required={isAddressRequired}
            />
            <Field
              fullWidth
              margin="normal"
              variant="outlined"
              name="address2"
              label={tBasics('address2')}
              component={CustomTextField}
            />

            <TwoColumnsGrid
              left={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="zipCode"
                  label={tBasics('zipCode')}
                  component={CustomTextField}
                  required={isAddressRequired}
                />
              }
              right={
                <Field
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  name="city"
                  label={tBasics('city')}
                  component={CustomTextField}
                  required={isAddressRequired}
                />
              }
            />

            <ISO31661Selector
              format="alpha2"
              autocompleteProps={{ disabled: isSubmitting }}
              textFieldProps={{
                fullWidth: true,
                margin: 'normal',
                required: isAddressRequired,
                name: 'countryOfResidence',
                label: tBasics('countryOfResidence'),
                error: Boolean(
                  touched.countryOfResidence && errors.countryOfResidence,
                ),
                // helperText:
                //   touched.countryOfResidence && yupHelperTextTranslator(tYup, formikProps.errors.Address?.Country),
                onBlur: () => setFieldTouched('countryOfResidence'),
              }}
              defaultValue={initialValues.countryOfResidence?.toLowerCase()}
              onChange={(v: string | null) => {
                setFieldTouched('countryOfResidence');
                setFieldValue('countryOfResidence', v?.toUpperCase() || '');
              }}
              value={values.countryOfResidence || ''}
            />
          </Box>
          <Box p={2} pt={0} display="flex" justifyContent="center">
            <Button variant="contained" disabled={isSubmitting} type="submit">
              {tBasics('save')}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default UserInfosForm;
