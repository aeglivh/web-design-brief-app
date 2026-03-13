import type { UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Input, Select, Chip, RadioGroup } from "@/components/ui";
import {
  PAYMENT_GATEWAY_OPTIONS,
  SHIPPING_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const PRODUCT_TYPE_OPTIONS = [
  "Physical products",
  "Digital products",
  "Services",
  "Subscriptions",
  "Gift cards",
];

const shippingOptions = SHIPPING_OPTIONS.map((o) => ({ value: o, label: o }));

export function Step09_Ecommerce({ form, accent }: StepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const productTypes = watch("ecommerceProductTypes") ?? [];
  const paymentGateways = watch("ecommercePaymentGateways") ?? [];
  const inventory = watch("ecommerceInventory") ?? "";
  const importData = watch("ecommerceImport") ?? "";

  function toggleProductType(type: string) {
    const next = productTypes.includes(type)
      ? productTypes.filter((t) => t !== type)
      : [...productTypes, type];
    setValue("ecommerceProductTypes", next, { shouldValidate: true });
  }

  function togglePaymentGateway(gateway: string) {
    const next = paymentGateways.includes(gateway)
      ? paymentGateways.filter((g) => g !== gateway)
      : [...paymentGateways, gateway];
    setValue("ecommercePaymentGateways", next, { shouldValidate: true });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          E-commerce Details
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Tell us about your online store requirements.
        </p>
      </div>

      <Input
        label="How many products do you plan to sell?"
        register={register("ecommerceProductCount")}
        error={errors.ecommerceProductCount?.message}
        placeholder="e.g., 50, 100-500, 1000+"
      />

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Product Types
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRODUCT_TYPE_OPTIONS.map((type) => (
            <Chip
              key={type}
              label={type}
              selected={productTypes.includes(type)}
              onClick={() => toggleProductType(type)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Payment Gateways
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAYMENT_GATEWAY_OPTIONS.map((gateway) => (
            <Chip
              key={gateway}
              label={gateway}
              selected={paymentGateways.includes(gateway)}
              onClick={() => togglePaymentGateway(gateway)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      <Select
        label="Shipping"
        options={shippingOptions}
        register={register("ecommerceShipping")}
        error={errors.ecommerceShipping?.message}
        placeholder="Select shipping method"
      />

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Inventory Tracking
        </label>
        <RadioGroup
          name="ecommerceInventory"
          options={[
            { value: "yes", label: "Yes, need inventory tracking" },
            { value: "no", label: "No inventory tracking needed" },
          ]}
          value={inventory}
          onChange={(val) =>
            setValue("ecommerceInventory", val, { shouldValidate: true })
          }
          accent={accent}
        />
        {errors.ecommerceInventory?.message && (
          <p className="mt-1 text-[11px] text-[#FF453A]">
            {errors.ecommerceInventory.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Data Import
        </label>
        <RadioGroup
          name="ecommerceImport"
          options={[
            { value: "yes", label: "Yes, importing from existing system" },
            { value: "no", label: "No, starting fresh" },
          ]}
          value={importData}
          onChange={(val) =>
            setValue("ecommerceImport", val, { shouldValidate: true })
          }
          accent={accent}
        />
        {errors.ecommerceImport?.message && (
          <p className="mt-1 text-[11px] text-[#FF453A]">
            {errors.ecommerceImport.message}
          </p>
        )}
      </div>
    </div>
  );
}
