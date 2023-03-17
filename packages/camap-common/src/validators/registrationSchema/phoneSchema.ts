import yup from "../custom-yup";

const PHONE_REGEX =
  /^(\+[0-9]{2}[\s\.]?[0-9]{1}|00[0-9]{3}|[0-9]{2}){1}[\s\.]?[0-9]{2}[\s\.]?[0-9]{2}[\s\.]?[0-9]{2}[\s\.]?[0-9]{2}[\s\.]?$/;

export const phoneValidation = yup.string().trim().matches(PHONE_REGEX);

export default yup.object().shape({
  phone: phoneValidation.required(),
  phone2: yup
    .string()
    .trim()
    .nullable()
    .transform((value: string, originalValue?: string) =>
      originalValue?.trim() === "" ? null : value
    )
    .matches(PHONE_REGEX)
    .notRequired(),
});
