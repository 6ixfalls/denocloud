import * as React from 'react';
import { useFormContext } from "./Form/FormContext";
import invariant from 'tiny-warning';

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export const connect = (Component: any) => {
  return (props: any) => {
    const context = useFormContext();
    invariant(
      !!context,
      `Formik context is undefined, please verify you are rendering <Form>, <Field>, <FastField>, <FieldArray>, or your custom context-using component as a child of a <Formik> component. Component name: ${Component.name}`
    );

    return <Component formik={context} {...props} />;
  }
}