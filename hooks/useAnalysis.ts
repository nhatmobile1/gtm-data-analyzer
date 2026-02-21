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
import { COLUMN_SAMPLE_SIZE } from "@/lib/constants";

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

  const channelFunnel: FunnelRow[] = useMemo(() => {
    if (!rawData || !columns || !columns.channel) return funnel;
    if (selectedDim === columns.channel) return funnel;
    return analyzeFunnel(rawData, columns, columns.channel);
  }, [rawData, columns, selectedDim, funnel]);

  const dataContext: string = useMemo(() => {
    if (!rawData || !columns || !channelFunnel.length || !totals) return "";
    return buildDataContext(rawData, columns, channelFunnel, totals, dropOff);
  }, [rawData, columns, channelFunnel, totals, dropOff]);

  const applyParsed = useCallback(
    (name: string, data: CsvRow[], hdrs: string[]) => {
      setFileName(name);
      setHeaders(hdrs);
      const detected = detectColumns(hdrs, data.slice(0, COLUMN_SAMPLE_SIZE));
      setColumns(detected);
      setRawData(data);
      setSelectedDim(detected.channel || hdrs[0]);
      setCrossCutDim(detected.dimensions[0] || null);
      setParsing(false);
    },
    // setState setters are stable — empty deps is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadCSVText = useCallback(
    (name: string, csvText: string) => {
      setParsing(true);
      // Use setTimeout to yield to React so the parsing spinner renders
      // before the synchronous parse blocks the main thread
      setTimeout(() => {
        const result = Papa.parse<CsvRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        applyParsed(name, result.data, result.meta.fields || []);
      }, 0);
    },
    [applyParsed]
  );

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
    loadCSVText,
    reset,
  };
}
