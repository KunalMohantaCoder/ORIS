"use client";

import { create } from "zustand";
import { api } from "../lib/api";

export const useOrisStore = create((set, get) => ({
  objects: [],
  summary: null,
  heatmap: [],
  meta: null,
  filters: {
    search: "",
    type: "all",
    regime: "ALL"
  },
  loading: false,
  error: "",
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  loadOrbital: async () => {
    const { filters } = get();
    set({ loading: true, error: "" });
    try {
      const query = new URLSearchParams({
        search: filters.search,
        type: filters.type,
        regime: filters.regime,
        limit: "900"
      });
      const [objects, summary, heatmap] = await Promise.all([
        api.get(`/orbital/objects?${query.toString()}`),
        api.get("/orbital/summary"),
        api.get("/orbital/heatmap")
      ]);
      set({
        objects: objects.data,
        summary: summary.data,
        heatmap: heatmap.data,
        meta: objects.meta,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
