"use client";

import { useState, useMemo, useCallback } from "react";
import Papa from "papaparse";
import type {
  CsvRow,
  DetectedColumns,
  FunnelRow,
  DropOffResult,
  VarianceResult,
  Totals,
} from "@/lib/types";
import { detectColumns } from "@/lib/columnDetection";
import {
  analyzeFunnel,
  analyzeDropOff,
  calculateVariance,
  calculateTotals,
} from "@/lib/analysis";
import { buildDataContext } from "@/lib/dataContext";

export function useAnalysis() {
  const [rawData, setRawData] = useState<CsvRow[] | null>(null);
  const [columns, setColumns] = useState<DetectedColumns | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedDim, setSelectedDim] = useState<string | null>(null);
  const [crossCutDim, setCrossCutDim] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const funnel: FunnelRow[] = useMemo(() => {
    if (!rawData || !columns || !selectedDim) return [];
    return analyzeFunnel(rawData, columns, selectedDim);
  }, [rawData, columns, selectedDim]);

  const totals: Totals | null = useMemo(() => {
    if (!funnel.length) return null;
    return calculateTotals(funnel);
  }, [funnel]);

  const crossCut: FunnelRow[] = useMemo(() => {
    if (!rawData || !crossCutDim || !columns) return [];
    return analyzeFunnel(rawData, columns, crossCutDim);
  }, [rawData, crossCutDim, columns]);

  const dropOff: DropOffResult | null = useMemo(() => {
    if (!rawData || !columns) return null;
    return analyzeDropOff(rawData, columns);
  }, [rawData, columns]);

  const variance: VarianceResult | null = useMemo(() => {
    if (!crossCut.length) return null;
    return calculateVariance(crossCut);
  }, [crossCut]);

  const allDimOptions: string[] = useMemo(() => {
    if (!columns) return [];
    return [
      columns.channel,
      columns.campaign,
      columns.interactionStatus,
      ...columns.dimensions,
    ].filter(Boolean) as string[];
  }, [columns]);

  const dataContext: string = useMemo(() => {
    if (!rawData || !columns || !funnel.length || !totals) return "";
    return buildDataContext(rawData, columns, funnel, totals, dropOff);
  }, [rawData, columns, funnel, totals, dropOff]);

  const loadCSV = useCallback((file: File) => {
    setFileName(file.name);
    setParsing(true);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data;
        const hdrs = result.meta.fields || [];
        setHeaders(hdrs);
        const detected = detectColumns(hdrs, data.slice(0, 100));
        setColumns(detected);
        setRawData(data);
        setSelectedDim(detected.channel || hdrs[0]);
        setCrossCutDim(detected.dimensions[0] || null);
        setParsing(false);
      },
    });
  }, []);

  const reset = useCallback(() => {
    setRawData(null);
    setColumns(null);
    setHeaders([]);
    setFileName("");
    setSelectedDim(null);
    setCrossCutDim(null);
    setParsing(false);
  }, []);

  return {
    rawData,
    parsing,
    columns,
    headers,
    fileName,
    selectedDim,
    crossCutDim,
    funnel,
    totals,
    crossCut,
    dropOff,
    variance,
    allDimOptions,
    dataContext,
    setSelectedDim,
    setCrossCutDim,
    loadCSV,
    reset,
  };
}
