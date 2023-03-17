import { ApolloError } from '@apollo/client';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Collapse,
  FormControl,
  InputAdornment,
  LinearProgress,
  MenuItem,
} from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Select, TextField } from 'formik-mui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from '../../components/forms/Pickers/DatePicker';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import {
  CreateMembershipInput,
  MembershipAvailableYears,
  MultiDistrib,
  useCreateMembershipMutation,
} from '../../gql';
import { formatAbsoluteDate } from '../../utils/fomat';

interface MembershipFormProps {
  userId: number;
  groupId: number;
  availableYears: Pick<MembershipAvailableYears, 'name' | 'id'>[];
  distributions: Pick<MultiDistrib, 'id' | 'distribStartDate'>[];
  distributionId?: number;
  membershipFee?: number | null;
  onSubmit: () => void;
  onSubmitComplete: (success: boolean) => void;
}

interface FormProps {
  date: Date;
  year: number;
  fee: number;
  distributionId: number;
}

const TODAY_YEAR = new Date().getFullYear();

const MembershipForm = ({
  userId,
  groupId,
  availableYears,
  distributions,
  distributionId,
  membershipFee,
  onSubmit,
  onSubmitComplete,
}: MembershipFormProps) => {
  const { t } = useTranslation(['membership/default']);
  const { t: tPayment } = useTranslation(['payments/default']);
  const { t: tBasics } = useTranslation(['translation']);

  const [gqlError, setGqlError] = React.useState<ApolloError | undefined>(
    undefined,
  );

  const [createMembershipMutation] = useCreateMembershipMutation();

  const initialValues = React.useMemo(() => {
    const foundDefaultYear = availableYears?.find((y) => y.id === TODAY_YEAR);
    let initialYear = foundDefaultYear && foundDefaultYear.id;
    if (!initialYear && availableYears.length > 0)
      initialYear = availableYears![0].id;

    return {
      date: new Date(),
      year: initialYear || '',
      fee: membershipFee || '',
      distributionId: distributionId || -1,
    };
  }, [availableYears, membershipFee, distributionId]);

  const handleSubmit = async (
    values: FormProps,
    formikBag: FormikHelpers<FormProps>,
  ) => {
    onSubmit();
    setGqlError(undefined);
    formikBag.setSubmitting(true);
    try {
      const input: CreateMembershipInput = {
        userId,
        groupId,
        year: values.year,
        date: values.date,
        membershipFee: values.fee,
      };
      if (values.distributionId !== -1)
        input.distributionId = values.distributionId;

      await createMembershipMutation({
        variables: {
          input,
        },
      });
      formikBag.resetForm();
      formikBag.setSubmitting(false);
      onSubmitComplete(true);
    } catch (e) {
      setGqlError(e);
      formikBag.setSubmitting(false);
      onSubmitComplete(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <>
          <Collapse in={gqlError !== undefined}>
            <Box m={2}>{gqlError && <ApolloErrorAlert error={gqlError} />}</Box>
          </Collapse>
          <Form>
            <CardContent>
              <FormControl fullWidth>
                <DatePicker
                  inputFormat="EEEE d MMMM yyyy"
                  label={`${t('subscriptionPaymentDate')}`}
                  value={formikProps.values.date}
                  disabled={formikProps.isSubmitting}
                  onChange={(newDate: any) => {
                    formikProps.setFieldValue('date', newDate);
                  }}
                  textFieldProps={{
                    fullWidth: true,
                    required: true,
                  }}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <Field
                  component={Select}
                  name="year"
                  fullWidth
                  required
                  label={t('year')}
                >
                  {availableYears!.map((y) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name}
                    </MenuItem>
                  ))}
                </Field>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <Field
                  component={TextField}
                  fullWidth
                  required
                  name="fee"
                  label={t('amount')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">€</InputAdornment>
                    ),
                  }}
                  // eslint-disable-next-line react/jsx-no-duplicate-props
                  inputProps={{
                    min: 0.01,
                    step: 0.01,
                  }}
                  type="number"
                />
              </FormControl>
              {distributions.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <Field
                    component={Select}
                    disabled={initialValues.distributionId !== -1}
                    name="distributionId"
                    fullWidth
                    label={t('duringDistribution')}
                  >
                    <MenuItem value={-1}>
                      <span>&nbsp;</span>
                    </MenuItem>
                    {distributions.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {t('distributionOfDate', {
                          date: formatAbsoluteDate(
                            new Date(d.distribStartDate),
                            true,
                          ).toLowerCase(),
                        })}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              )}
            </CardContent>
            <CardActions>
              <Box my={2} display="flex" justifyContent="center" width="100%">
                <Button
                  disabled={formikProps.isSubmitting}
                  variant="contained"
                  type="submit"
                >
                  {tBasics('validate')}
                </Button>
              </Box>
            </CardActions>
            <>{formikProps.isSubmitting && <LinearProgress />}</>
          </Form>
        </>
      )}
    </Formik>
  );
};

export default MembershipForm;
