import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const signupSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
});