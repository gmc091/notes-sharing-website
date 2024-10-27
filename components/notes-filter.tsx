import React, { memo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface NotesFilterProps {
  selectedSchools: string[];
  selectedSubjects: string[];
  selectedYears: string[];
  onSchoolsChange: (schools: string[]) => void;
  onSubjectsChange: (subjects: string[]) => void;
  onYearsChange: (years: string[]) => void;
  onClearFilters: () => void;
  orientation?: "horizontal" | "vertical";
}

export const FilterSelect = memo(
  ({
    items,
    selectedValues,
    onChange,
    placeholder,
    label,
  }: {
    items: Array<string | FilterOption>;
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    label: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "h-8 border-dashed",
              !selectedValues.length && "text-muted-foreground"
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{label}:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((value) => {
                    const item =
                      typeof items[0] === "string"
                        ? value
                        : (items as FilterOption[]).find(
                            (i) => i.value === value
                          )?.label || value;
                    return (
                      <Badge
                        variant="secondary"
                        key={value}
                        className="text-xs rounded-sm px-1"
                      >
                        {item}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs text-muted-foreground mr-1">
                  {label}:
                </span>
                <span className="text-xs">{placeholder}</span>
              </>
            )}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder={`Cerca ${label.toLowerCase()}...`}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const value = typeof item === "string" ? item : item.value;
                  const label = typeof item === "string" ? item : item.label;
                  const isSelected = selectedValues.includes(value);

                  return (
                    <CommandItem
                      key={value}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? selectedValues.filter((v) => v !== value)
                            : [...selectedValues, value]
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-sm">{label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

FilterSelect.displayName = "FilterSelect";

export const NotesFilter = memo(function NotesFilter({
  selectedSchools,
  selectedSubjects,
  selectedYears,
  onSchoolsChange,
  onSubjectsChange,
  onYearsChange,
  onClearFilters,
  orientation = "horizontal",
}: NotesFilterProps) {
  const hasActiveFilters =
    selectedSchools.length > 0 ||
    selectedSubjects.length > 0 ||
    selectedYears.length > 0;

  const containerClasses = cn(
    "flex gap-2",
    orientation === "vertical" ? "flex-col w-full" : "flex-wrap items-center"
  );

  return (
    <div className={containerClasses}>
      <FilterSelect
        items={schoolTypes}
        selectedValues={selectedSchools}
        onChange={onSchoolsChange}
        placeholder="Tutti"
        label="Scuola"
      />
      <FilterSelect
        items={allSubjects}
        selectedValues={selectedSubjects}
        onChange={onSubjectsChange}
        placeholder="Tutte"
        label="Materia"
      />
      <FilterSelect
        items={years}
        selectedValues={selectedYears}
        onChange={onYearsChange}
        placeholder="Tutti"
        label="Anno"
      />
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Rimuovi filtri
        </Button>
      )}
    </div>
  );
});

NotesFilter.displayName = "NotesFilter";

// Constants moved to top level
const schoolTypes = [
  "Liceo scientifico",
  "Liceo classico",
  "Liceo linguistico",
  "Scienze umane",
];

const allSubjects = Array.from(
  new Set([
    "Latino",
    "Matematica",
    "Scienze",
    "Fisica",
    "Italiano",
    "Storia",
    "Filosofia",
    "Inglese",
    "Greco",
    "Francese",
    "Tedesco",
    "Spagnolo",
    "Scienze umane",
    "Diritto",
    "Economia",
  ])
).sort();

const years: FilterOption[] = [
  { label: "Primo anno", value: "1" },
  { label: "Secondo anno", value: "2" },
  { label: "Terzo anno", value: "3" },
  { label: "Quarto anno", value: "4" },
  { label: "Quinto anno", value: "5" },
];

export default NotesFilter;
