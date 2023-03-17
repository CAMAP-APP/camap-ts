import yup from "../custom-yup";
import userSchema from "./userSchema";

export default userSchema.shape({
  tos: yup.bool().required().oneOf([true]),
  password: yup.string().min(8).required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref("password")], "passwordsMustMatch"),
});
