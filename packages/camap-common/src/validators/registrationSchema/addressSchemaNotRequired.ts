import yup from "../custom-yup";

export default yup.object().shape({
  zipCode: yup
    .string()
    .trim()
    .matches(/(^\d{5}$)|(^\d{4}$)/)
    .nullable()
    .transform((value: string, originalValue?: string) =>
      originalValue?.trim() === "" ? null : value
    ),
  address1: yup
    .string()
    .trim()
    .nullable()
    .transform((value: string, originalValue?: string) =>
      originalValue?.trim() === "" ? null : value
    ),
  city: yup
    .string()
    .trim()
    .nullable()
    .transform((value: string, originalValue?: string) =>
      originalValue?.trim() === "" ? null : value
    ),
});
