import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDebounce } from "./use-debounce";

export const ITEMS_PER_PAGE = 6;

type FilterParams = {
  schools?: string[];
  subjects?: string[];
  years?: string[];
  search?: string | null;
  page?: string;
};

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get values from URL using useMemo to prevent unnecessary recalculations
  const { selectedSchools, selectedSubjects, selectedYears, currentPage } =
    useMemo(
      () => ({
        selectedSchools: searchParams.getAll("schools"),
        selectedSubjects: searchParams.getAll("subjects"),
        selectedYears: searchParams.getAll("years"),
        currentPage: Number(searchParams.get("page")) || 1,
      }),
      [searchParams]
    );

  // Local state for search with debouncing
  const [searchQuery, setSearchQueryState] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 300);

  const createQueryString = useCallback((params: FilterParams) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.filter(Boolean).forEach((v) => {
          newSearchParams.append(key, v);
        });
      } else if (value?.trim()) {
        newSearchParams.set(key, value.trim());
      }
    });

    if (params.page && params.page !== "1") {
      newSearchParams.set("page", params.page);
    }

    return newSearchParams.toString();
  }, []);

  const updateFilters = useCallback(
    (params: FilterParams, shouldScroll = false) => {
      const queryString = createQueryString({
        ...params,
        page: params.page || "1",
      });

      const url = `/?${queryString}`;

      // Only update if the URL would actually change
      if (url !== window.location.pathname + window.location.search) {
        if (pathname !== "/") {
          router.push(url);
        } else {
          router.push(url, { scroll: shouldScroll });
        }
      }
    },
    [router, pathname, createQueryString]
  );

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      updateFilters({
        schools: selectedSchools,
        subjects: selectedSubjects,
        years: selectedYears,
        search: debouncedSearch || null,
      });
    }
  }, [
    debouncedSearch,
    searchParams,
    selectedSchools,
    selectedSubjects,
    selectedYears,
    updateFilters,
  ]);

  const setSchools = useCallback(
    (schools: string[]) => {
      updateFilters({
        schools,
        subjects: selectedSubjects,
        years: selectedYears,
        search: searchParams.get("search") || null,
      });
    },
    [updateFilters, selectedSubjects, selectedYears, searchParams]
  );

  const setSubjects = useCallback(
    (subjects: string[]) => {
      updateFilters({
        schools: selectedSchools,
        subjects,
        years: selectedYears,
        search: searchParams.get("search") || null,
      });
    },
    [updateFilters, selectedSchools, selectedYears, searchParams]
  );

  const setYears = useCallback(
    (years: string[]) => {
      updateFilters({
        schools: selectedSchools,
        subjects: selectedSubjects,
        years,
        search: searchParams.get("search") || null,
      });
    },
    [updateFilters, selectedSchools, selectedSubjects, searchParams]
  );

  const setSearch = useCallback((search: string) => {
    setSearchQueryState(search);
  }, []);

  const setPage = useCallback(
    (page: number) => {
      updateFilters(
        {
          schools: selectedSchools,
          subjects: selectedSubjects,
          years: selectedYears,
          search: searchParams.get("search") || null,
          page: page.toString(),
        },
        true
      );
    },
    [
      updateFilters,
      selectedSchools,
      selectedSubjects,
      selectedYears,
      searchParams,
    ]
  );

  const clearFilters = useCallback(() => {
    setSearchQueryState("");
    if (pathname + window.location.search !== "/") {
      router.push("/");
    }
  }, [router, pathname]);

  return {
    selectedSchools,
    selectedSubjects,
    selectedYears,
    searchQuery,
    debouncedSearch,
    currentPage,
    setSchools,
    setSubjects,
    setYears,
    setSearch,
    setPage,
    clearFilters,
  };
}
