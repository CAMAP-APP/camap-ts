import * as yup from 'yup';

export default yup.object().shape({
  NODE_ENV: yup
    .string()
    .oneOf(['development', 'production', 'test', 'provision'])
    .default('development'),

  FRONT_URL: yup.string().required(),
  CAMAP_HOST: yup.string().required(),

  CAMAP_KEY: yup.string().required(),
  JWT_ACCESS_TOKEN_SECRET: yup.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: yup.number().required(),
  JWT_REFRESH_TOKEN_SECRET: yup.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: yup.number().required(),

  DB_CONNECTION: yup.string().required(),
  // DB_SYNCHRONIZE: yup.boolean().when('NODE_ENV', {
  //   is: 'test',
  //   then: yup.boolean().oneOf([true]),
  //   otherwise: yup.boolean().oneOf([false]),
  // }),

  MAILER_TRANSPORT: yup.string().oneOf(['smtp']).required(),

  SMTP_HOST: yup.string().when('MAILER_TRANSPORT', {
    is: (v: string) => v === 'smtp',
    then: yup.string().required(),
  }),
  SMTP_PORT: yup.string().when('MAILER_TRANSPORT', {
    is: (v: string) => v === 'smtp',
    then: yup.string().required(),
  }),
  SMTP_SECURE: yup.string().when('MAILER_TRANSPORT', {
    is: (v: string) => v === 'smtp',
    then: yup.string().required(),
  }),
  SMTP_AUTH_USER: yup.string().when('MAILER_TRANSPORT', {
    is: (v: string) => v === 'smtp',
    then: yup.string().required(),
  }),
  SMTP_AUTH_PASS: yup.string().when('MAILER_TRANSPORT', {
    is: (v: string) => v === 'smtp',
    then: yup.string().required(),
  }),
});
