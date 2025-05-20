import React, { createContext, useContext } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Define o tipo genérico do formulário, garantindo que T extenda FieldValues
interface DrawerFormContextType<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
}

// Cria o contexto genérico (usamos any para permitir qualquer tipo de formulário)
const DrawerFormContext = createContext<DrawerFormContextType<any> | null>(null);

// Provider que envolve o form do drawer
export function DrawerFormProvider<T extends FieldValues>({
  children,
  formMethods,
}: {
  children: React.ReactNode;
  formMethods: UseFormReturn<T>;
}) {
  return (
    <DrawerFormContext.Provider value={{ formMethods }}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </DrawerFormContext.Provider>
  );
}

// Hook para consumir o contexto e expor watch, setValue, etc.
export function useDrawerFormContext<T extends FieldValues>() {
  // o contexto armazena formMethods como any, mas retornamos tipado
  const context = useContext(DrawerFormContext as React.Context<DrawerFormContextType<T> | null>);
  if (!context) {
    throw new Error(
      "useDrawerFormContext must be used within a DrawerFormProvider"
    );
  }
  return context.formMethods as UseFormReturn<T>;
}