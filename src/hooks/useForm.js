import { useState, useCallback } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export const useForm = (initialValues, validationSchema, onSubmit) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        await onSubmit(values, formikHelpers);
      } catch (error) {
        setSubmitError(error.message || 'Une erreur est survenue');
        formikHelpers.setSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const resetForm = useCallback(() => {
    formik.resetForm();
    setSubmitError(null);
  }, [formik]);

  const setFieldValue = useCallback((field, value) => {
    formik.setFieldValue(field, value);
  }, [formik]);

  return {
    ...formik,
    isSubmitting,
    submitError,
    resetForm,
    setFieldValue
  };
};

// Hook spécialisé pour les formulaires avec upload de fichiers
export const useFileUpload = (initialFiles = []) => {
  const [files, setFiles] = useState(initialFiles);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress(0);
  }, []);

  const updateProgress = useCallback((progress) => {
    setUploadProgress(progress);
  }, []);

  return {
    files,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    updateProgress
  };
};

// Hook pour la validation en temps réel
export const useValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(async (field, value) => {
    try {
      await validationSchema.validateAt(field, { [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [field]: error.message }));
    }
  }, [validationSchema]);

  const validateForm = useCallback(async (values) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [validationSchema]);

  const setFieldTouched = useCallback((field, touchedValue = true) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched
  };
};