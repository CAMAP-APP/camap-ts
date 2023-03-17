import yup from "../custom-yup";

export const zipCodeValidation = yup
  .string()
  .trim()
  .matches(/(^\d{5}$)|(^\d{4}$)/)
  .required();

export default yup.object().shape({
  zipCode: zipCodeValidation,
  address1: yup.string().trim().required(),
  city: yup.string().trim().required(),
});
