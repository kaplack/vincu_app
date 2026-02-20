import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BUSINESS_CATEGORIES } from "@/features/loyalty/constants/businessCategories";

/**
 * BusinessCategorySelect
 * Componente reutilizable para seleccionar categoría de negocio
 *
 * Props:
 * - value: string
 * - onChange: (value: string) => void
 * - disabled?: boolean
 * - placeholder?: string
 */
export default function BusinessCategorySelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Selecciona una categoría",
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {BUSINESS_CATEGORIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
