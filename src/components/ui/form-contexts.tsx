import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import React, { use } from 'react';
import { useFormContext } from 'react-hook-form';

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};
type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

export const useFormField = () => {
  const fieldContext = use(FormFieldContext);
  const itemContext = use(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext as FormItemContextValue;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export type { ControllerProps, FieldPath, FieldValues };
