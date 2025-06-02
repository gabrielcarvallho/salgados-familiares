// INPUT.TSX - Solução 1: Ajustar os tipos

"use client";

import * as React from "react";
import IMask from "imask";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Info } from "lucide-react";

export type MaskType =
  | "cpf"
  | "cnpj"
  | "phone"
  | "cellphone"
  | "cep"
  | "currency"
  | "date"
  | "time"
  | "credit-card"
  | "custom";

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  error?: string | undefined;
  icon?: React.ElementType;
  info?: string;
  
  // Permitir null no valor para compatibilidade com React Hook Form
  value?: string | number | readonly string[] | null | undefined;
  
  mask?: MaskType;
  maskOptions?: any;
  unmasked?: boolean;
  onChange?:
    | ((value: string, unmaskedValue: string, event?: Event) => void)
    | ((event: React.ChangeEvent<HTMLInputElement>) => void);
}

// ... resto das configurações de máscara permanecem iguais ...

const getMaskConfig = (maskType: MaskType, customOptions?: any): any => {
  const configs = {
    cpf: {
      mask: "000.000.000-00",
    },
    cnpj: {
      mask: "00.000.000/0000-00",
    },
    phone: {
      mask: "(00) 0000-0000",
    },
    cellphone: {
      mask: "(00) 00000-0000",
    },
    cep: {
      mask: "00000-000",
    },
    currency: {
      mask: "R$ num",
      blocks: {
        num: {
          mask: Number,
          scale: 2,
          thousandsSeparator: ".",
          padFractionalZeros: true,
          normalizeZeros: true,
          radix: ",",
          mapToRadix: ["."],
        },
      },
    },
    date: {
      mask: Date,
      pattern: "d{/}m{/}Y",
      blocks: {
        d: { mask: IMask.MaskedRange, from: 1, to: 31 },
        m: { mask: IMask.MaskedRange, from: 1, to: 12 },
        Y: { mask: IMask.MaskedRange, from: 1900, to: 2100 },
      },
      format: (date: Date) => {
        return [
          String(date.getDate()).padStart(2, "0"),
          String(date.getMonth() + 1).padStart(2, "0"),
          date.getFullYear(),
        ].join("/");
      },
      parse: (str: string) => {
        const [day, month, year] = str.split("/").map(Number);
        return new Date(year, month - 1, day);
      },
    },
    time: {
      mask: "HH:MM",
      blocks: {
        HH: { mask: IMask.MaskedRange, from: 0, to: 23 },
        MM: { mask: IMask.MaskedRange, from: 0, to: 59 },
      },
    },
    "credit-card": {
      mask: "0000 0000 0000 0000",
    },
    custom: customOptions || {},
  };

  return configs[maskType] || customOptions;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      icon: Icon,
      info,
      placeholder,
      mask,
      maskOptions,
      unmasked = false,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [showError, setShowError] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const maskRef = React.useRef<any>(null);

    // Converter null para string vazia para compatibilidade
    const safeValue = value === null ? "" : value;
    const safeDefaultValue = defaultValue === null ? "" : defaultValue;

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (error) {
        setShowError(true);
        const timer = setTimeout(() => setShowError(false), 500);
        return () => clearTimeout(timer);
      }
    }, [error]);

    React.useEffect(() => {
      if (mask && inputRef.current) {
        const maskConfig = getMaskConfig(mask, maskOptions);

        if (maskRef.current) {
          maskRef.current.destroy();
        }

        maskRef.current = IMask(inputRef.current, maskConfig);

        if (onChange) {
          maskRef.current.on("accept", () => {
            const maskedValue = maskRef.current.value;
            const unmaskedValue = maskRef.current.unmaskedValue;
            const valueToReturn = unmasked ? unmaskedValue : maskedValue;

            (
              onChange as (
                value: string,
                unmaskedValue: string,
                event?: Event
              ) => void
            )(valueToReturn, unmaskedValue);
          });
        }

        // Usar valor seguro (sem null)
        if (safeValue !== undefined) {
          if (unmasked) {
            maskRef.current.unmaskedValue = safeValue;
          } else {
            maskRef.current.value = safeValue;
          }
        } else if (safeDefaultValue !== undefined) {
          if (unmasked) {
            maskRef.current.unmaskedValue = safeDefaultValue;
          } else {
            maskRef.current.value = safeDefaultValue;
          }
        }

        return () => {
          if (maskRef.current) {
            maskRef.current.destroy();
          }
        };
      }
    }, [mask, maskOptions, onChange, unmasked]);

    React.useEffect(() => {
      if (maskRef.current && safeValue !== undefined) {
        if (unmasked) {
          if (maskRef.current.unmaskedValue !== safeValue) {
            maskRef.current.unmaskedValue = safeValue;
          }
        } else {
          if (maskRef.current.value !== safeValue) {
            maskRef.current.value = safeValue;
          }
        }
      }
    }, [safeValue, unmasked]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!mask && onChange) {
          const v = e.target.value;
          (onChange as (value: string, unmasked: string) => void)(v, v);
        }
      },
      [mask, onChange]
    );

    return (
      <div className="w-full">
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {error ? (
                <Icon className="h-4 w-4 text-destructive" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
          )}
          <input
            type={type}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
              "bg-transparent dark:bg-input/30",
              "border",
              "border-input",
              "flex h-9 w-full min-w-0 rounded-md py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none",
              "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              Icon ? "pl-10 pr-3" : "px-3",
              error && [
                "border-destructive",
                "focus-visible:border-destructive focus-visible:ring-destructive/20",
                "text-destructive",
                showError && "animate-shake",
              ],
              className
            )}
            // Usar valores seguros para inputs sem máscara
            value={!mask ? safeValue : undefined}
            defaultValue={!mask ? safeDefaultValue : undefined}
            ref={inputRef}
            aria-invalid={error ? "true" : "false"}
            placeholder={placeholder}
            onChange={handleChange}
            {...props}
          />
          {info && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1 animate-slide-down">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };