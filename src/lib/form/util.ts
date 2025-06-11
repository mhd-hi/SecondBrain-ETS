import type { ChangeEvent } from 'react';

/**
 * Generic form change handler that updates a form state object
 */
export const handleFormChange = <T extends Record<string, string | number | boolean | Date | null | undefined>>(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};

/**
 * Generic form submit handler that updates a form state object with a timestamp
 */
export const handleFormSubmit = async <T extends Record<string, string | number | boolean | Date | null | undefined>>(
  e: React.FormEvent,
  formData: T,
  onSave: (updatedData: T) => Promise<void>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const updatedData = {
      ...formData,
      updatedAt: new Date(),
    };

    await onSave(updatedData);
  } finally {
    setIsLoading(false);
  }
};
