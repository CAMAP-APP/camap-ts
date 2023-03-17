import { FormikHelpers } from 'formik';

export interface MessagesFormValues {
  senderName: string;
  senderEmail: string;
  recipientsList: string | undefined;
  object: string;
  message: string;
}

export type MessagesFormikBag = FormikHelpers<MessagesFormValues>;
