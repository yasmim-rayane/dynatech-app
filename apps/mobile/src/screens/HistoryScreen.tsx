import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FileText, Table } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../services/api";
import type { ResultResponse } from "../services/api";
import { generoToFront, maoToFront } from "../services/api";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ForceType = "palmar" | "pinca";
type PalmarSub = "direita" | "esquerda";
type PincaSub = "indicador" | "medio" | "anelar" | "minimo";
type PincaHand = "direita" | "esquerda";

const PALMAR_SUBS: { key: PalmarSub; label: string }[] = [
  { key: "direita", label: "Mão Direita" },
  { key: "esquerda", label: "Mão Esquerda" },
];
const PINCA_SUBS: { key: PincaSub; label: string }[] = [
  { key: "indicador", label: "Indicador" },
  { key: "medio", label: "Médio" },
  { key: "anelar", label: "Anelar" },
  { key: "minimo", label: "Mínimo" },
];
const PINCA_HANDS: { key: PincaHand; label: string }[] = [
  { key: "direita", label: "Mão Direita" },
  { key: "esquerda", label: "Mão Esquerda" },
];

type DataPoint = { name: string; v: number }[];
const gen = (base: number[], names: string[]): DataPoint =>
  base.map((v, i) => ({ name: names[i] ?? `P${i + 1}`, v }));

const d15n = ["Dia 1","Dia 3","Dia 5","Dia 7","Dia 9","Dia 11","Dia 13","Dia 15"];
const d30n = ["Dia 1","Dia 5","Dia 10","Dia 15","Dia 20","Dia 25","Dia 30"];
const d60n = ["Sem. 1","Sem. 2","Sem. 3","Sem. 4","Sem. 5","Sem. 6","Sem. 7","Sem. 8"];
const dcn  = ["Med. 1","Med. 2","Med. 3","Med. 4","Med. 5"];

const mockData: Record<string, Record<string, DataPoint>> = {
  "palmar-direita":  { "15": gen([38,39,41,40,42,43,41.5,44], d15n), "30": gen([35,37,39,40,42,41,44], d30n), "60": gen([33,35,37,39,41,42,43,44.5], d60n), "custom": gen([36,38,39,41,43], dcn) },
  "palmar-esquerda": { "15": gen([35,36,38,37,39,40,38.5,41], d15n), "30": gen([32,34,36,37,39,38,41], d30n), "60": gen([30,32,34,36,38,39,40,41.5], d60n), "custom": gen([33,35,36,38,40], dcn) },
  // Pinça — Mão Direita
  "pinca-direita-indicador": { "15": gen([7.5,7.8,8.0,8.1,8.4,8.3,8.5,8.8], d15n), "30": gen([7.0,7.5,7.8,8.2,8.4,8.7,9.0], d30n), "60": gen([6.5,6.8,7.1,7.5,7.9,8.2,8.5,8.9], d60n), "custom": gen([7.0,7.4,7.9,8.2,8.5], dcn) },
  "pinca-direita-medio":     { "15": gen([6.8,7.0,7.2,7.4,7.6,7.5,7.7,8.0], d15n), "30": gen([6.3,6.8,7.1,7.5,7.7,8.0,8.3], d30n), "60": gen([5.8,6.1,6.4,6.8,7.2,7.5,7.8,8.2], d60n), "custom": gen([6.5,6.9,7.3,7.6,7.9], dcn) },
  "pinca-direita-anelar":    { "15": gen([5.5,5.7,5.9,6.1,6.3,6.2,6.4,6.6], d15n), "30": gen([5.0,5.4,5.7,6.0,6.2,6.5,6.8], d30n), "60": gen([4.5,4.8,5.1,5.5,5.9,6.2,6.5,6.9], d60n), "custom": gen([5.2,5.6,6.0,6.3,6.6], dcn) },
  "pinca-direita-minimo":    { "15": gen([4.2,4.4,4.6,4.7,4.9,4.8,5.0,5.2], d15n), "30": gen([3.8,4.1,4.4,4.7,4.9,5.1,5.4], d30n), "60": gen([3.5,3.8,4.1,4.4,4.7,5.0,5.3,5.6], d60n), "custom": gen([4.0,4.3,4.7,5.0,5.3], dcn) },
  // Pinça — Mão Esquerda (valores ~8% menores)
  "pinca-esquerda-indicador": { "15": gen([6.9,7.2,7.4,7.5,7.7,7.6,7.8,8.1], d15n), "30": gen([6.4,6.9,7.2,7.5,7.7,8.0,8.3], d30n), "60": gen([6.0,6.3,6.5,6.9,7.3,7.6,7.9,8.2], d60n), "custom": gen([6.5,6.8,7.3,7.6,7.9], dcn) },
  "pinca-esquerda-medio":     { "15": gen([6.2,6.4,6.6,6.8,7.0,6.9,7.1,7.4], d15n), "30": gen([5.8,6.2,6.5,6.9,7.1,7.4,7.7], d30n), "60": gen([5.3,5.6,5.9,6.3,6.6,6.9,7.2,7.6], d60n), "custom": gen([6.0,6.3,6.7,7.0,7.3], dcn) },
  "pinca-esquerda-anelar":    { "15": gen([5.0,5.2,5.4,5.6,5.8,5.7,5.9,6.1], d15n), "30": gen([4.6,4.9,5.2,5.5,5.7,6.0,6.3], d30n), "60": gen([4.1,4.4,4.7,5.0,5.4,5.7,6.0,6.4], d60n), "custom": gen([4.8,5.1,5.5,5.8,6.1], dcn) },
  "pinca-esquerda-minimo":    { "15": gen([3.8,4.0,4.2,4.3,4.5,4.4,4.6,4.8], d15n), "30": gen([3.4,3.7,4.0,4.3,4.5,4.7,5.0], d30n), "60": gen([3.1,3.4,3.7,4.0,4.3,4.6,4.9,5.2], d60n), "custom": gen([3.6,3.9,4.3,4.6,4.9], dcn) },
};

const fullList = [
  { date: "26/04", time: "14:32", type: "palmar", sub: "direita",   hand: "",        label: "Palmar Direita",             value: 42.5 },
  { date: "26/04", time: "14:35", type: "palmar", sub: "esquerda",  hand: "",        label: "Palmar Esquerda",            value: 39.1 },
  { date: "25/04", time: "08:10", type: "pinca",  sub: "indicador", hand: "direita", label: "Pinça Indicador (Dir.)",     value: 8.4 },
  { date: "25/04", time: "08:12", type: "pinca",  sub: "indicador", hand: "esquerda",label: "Pinça Indicador (Esq.)",     value: 7.8 },
  { date: "25/04", time: "08:14", type: "pinca",  sub: "medio",     hand: "direita", label: "Pinça Médio (Dir.)",         value: 7.6 },
  { date: "24/04", time: "19:40", type: "palmar", sub: "direita",   hand: "",        label: "Palmar Direita",             value: 41.8 },
  { date: "23/04", time: "07:52", type: "pinca",  sub: "anelar",    hand: "direita", label: "Pinça Anelar (Dir.)",        value: 6.3 },
  { date: "22/04", time: "09:15", type: "pinca",  sub: "minimo",    hand: "esquerda",label: "Pinça Mínimo (Esq.)",        value: 4.7 },
  { date: "20/04", time: "18:30", type: "pinca",  sub: "indicador", hand: "direita", label: "Pinça Indicador (Dir.)",     value: 7.9 },
];

export function HistoryScreen() {
  const [type, setType] = useState<ForceType>("palmar");
  const [palmarSub, setPalmarSub] = useState<PalmarSub>("direita");
  const [pincaHand, setPincaHand] = useState<PincaHand>("direita");
  const [pincaSub, setPincaSub] = useState<PincaSub>("indicador");
  const [range, setRange] = useState<"15" | "30" | "60" | "custom">("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { theme } = useTheme();
  const { user, email } = useAuth();
  const [allResults, setAllResults] = useState<ResultResponse[]>([]);

  // Fetch results from API
  useEffect(() => {
    if (!email) return;
    api.getAllResults(email)
      .then(setAllResults)
      .catch(() => setAllResults([]));
  }, [email]);
  
  const grid = theme === "dark" ? "#1F2A44" : "#E2E8F0";
  const tick = theme === "dark" ? "#94A3B8" : "#94A3B8";
  
  const accentColor = type === "palmar" ? "var(--brand-emerald)" : "var(--brand-cyan)";
  const accentSoft = type === "palmar" ? "var(--brand-emerald-soft)" : "var(--brand-cyan-soft)";

  // Helper: extract the right value from a result based on current filter
  function getResultValue(r: ResultResponse): number | null {
    if (type === "palmar") {
      return palmarSub === "direita" ? r.palmMaxD : r.palmMaxE;
    }
    const fingerMap: Record<PincaSub, string> = { indicador: "1", medio: "2", anelar: "3", minimo: "4" };
    const idx = fingerMap[pincaSub];
    const key = `pinchMax${pincaHand === "direita" ? "D" : "E"}${idx}` as keyof ResultResponse;
    return r[key] as number | null;
  }

  // Filter results by range
  const filteredResults = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    if (range === "custom" && startDate && endDate) {
      const [sd, sm, sy] = startDate.split("/").map(Number);
      const [ed, em, ey] = endDate.split("/").map(Number);
      const from = new Date(sy, sm - 1, sd);
      const to = new Date(ey, em - 1, ed, 23, 59, 59);
      return allResults.filter(r => {
        const d = new Date(r.examDate);
        return d >= from && d <= to;
      });
    }
    const days = range === "15" ? 15 : range === "30" ? 30 : 60;
    cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return allResults.filter(r => new Date(r.examDate) >= cutoff);
  }, [allResults, range, startDate, endDate]);

  // Transform to chart data points
  const currentData = useMemo(() => {
    return filteredResults
      .map(r => {
        const v = getResultValue(r);
        if (v == null) return null;
        const d = new Date(r.examDate);
        const name = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        return { name, v };
      })
      .filter(Boolean) as DataPoint;
  }, [filteredResults, type, palmarSub, pincaHand, pincaSub]);

  // Transform to list items
  const list = useMemo(() => {
    return filteredResults
      .map(r => {
        const v = getResultValue(r);
        if (v == null) return null;
        const d = new Date(r.examDate);
        const date = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        const subLabel = type === "palmar"
          ? (palmarSub === "direita" ? "Palmar Direita" : "Palmar Esquerda")
          : `Pin\u00e7a ${PINCA_SUBS.find(s => s.key === pincaSub)!.label} (${pincaHand === "direita" ? "Dir." : "Esq."})`;
        return { date, time, label: subLabel, value: v };
      })
      .filter(Boolean) as { date: string; time: string; label: string; value: number }[];
  }, [filteredResults, type, palmarSub, pincaHand, pincaSub]);
  
  const average = currentData.length > 0 ? currentData.reduce((acc, curr) => acc + curr.v, 0) / currentData.length : 0;
  
  const subLabel = type === "palmar"
    ? (palmarSub === "direita" ? "M\u00e3o Direita" : "M\u00e3o Esquerda")
    : `${PINCA_SUBS.find(s => s.key === pincaSub)!.label} (${pincaHand === "direita" ? "Dir." : "Esq."})`;

  /* ── Dados do usu\u00e1rio (real) ── */
  const userInfo = {
    nome: user?.name ?? "--",
    idade: user?.dataNascimento ? (() => {
      const [y, m, d] = user.dataNascimento.split("-").map(Number);
      const birth = new Date(y, m - 1, d);
      const diff = Date.now() - birth.getTime();
      return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)) + " anos";
    })() : "--",
    genero: user?.genero ? generoToFront(user.genero) : "--",
    maoDominante: user?.maoDominante ? maoToFront(user.maoDominante) : "--",
    peso: user?.peso != null ? user.peso.toFixed(2) + " kg" : "--",
    altura: user?.altura != null ? user.altura + " cm" : "--",
  };

  /** Calcula cor baseada na diferença % entre dois valores */
  function diffColor(a: number, b: number): { color: [number, number, number]; label: string } {
    const max = Math.max(a, b);
    if (max === 0) return { color: [0, 128, 0], label: "" };
    const pct = Math.abs(a - b) / max * 100;
    if (pct > 20) return { color: [220, 38, 38], label: `⚠ ${pct.toFixed(0)}% diferença` };
    if (pct >= 10) return { color: [202, 138, 4], label: `${pct.toFixed(0)}% diferença` };
    return { color: [0, 128, 0], label: "✓ Musculaturas equilibradas" };
  }

  /** Gera a logo DynaTech como imagem base64 via canvas */
  function generateLogoBase64(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d")!;
    // Background rounded rect
    ctx.fillStyle = "#0B2447";
    ctx.beginPath();
    ctx.roundRect(0, 0, 120, 120, 20);
    ctx.fill();
    // Gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 120, 120);
    grad.addColorStop(0, "#0B2447");
    grad.addColorStop(1, "#19376D");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, 120, 120, 20);
    ctx.fill();
    // Wave path
    ctx.strokeStyle = "#10D9A0";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(15, 72);
    ctx.quadraticCurveTo(30, 43, 45, 72);
    ctx.quadraticCurveTo(60, 101, 75, 72);
    ctx.quadraticCurveTo(90, 43, 105, 72);
    ctx.stroke();
    // Dot
    ctx.fillStyle = "#10D9A0";
    ctx.beginPath();
    ctx.arc(60, 34, 7, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL("image/png");
  }

  async function exportToPDF() {
    try {
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      let titleSuffix = `${range} dias`;
      let fileSuffix = `${range}dias`;
      if (range === "custom") {
        const startStr = startDate ? startDate.split("-").reverse().join("/") : "Início";
        const endStr = endDate ? endDate.split("-").reverse().join("/") : "Fim";
        titleSuffix = `Personalizado (${startStr} a ${endStr})`;
        fileSuffix = "Personalizado";
      }

      const reportType = type === "palmar" ? "Força Palmar" : "Força de Pinça";
      const brandDark: [number, number, number] = [11, 36, 71];
      const brandGreen: [number, number, number] = [16, 217, 160];

      /* ═══ Header band ═══ */
      doc.setFillColor(...brandDark);
      doc.rect(0, 0, pageW, 38, "F");

      const m = 10;

      const logoImg = generateLogoBase64();
      doc.addImage(logoImg, "PNG", m, 5, 28, 28);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("Dyna Tech", m + 34, 17);
      doc.setFontSize(9);
      doc.setTextColor(160, 200, 230);
      doc.text("Saúde e performance na sua mão", m + 34, 24);

      doc.setFontSize(10);
      doc.setTextColor(...brandGreen);
      doc.text(reportType, m + 34, 33);

      doc.setFontSize(8);
      doc.setTextColor(160, 200, 230);
      const now = new Date();
      doc.text(now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), pageW - m, 17, { align: "right" });
      doc.text(`Período: ${titleSuffix}`, pageW - m, 24, { align: "right" });

      /* ═══ Green accent line ═══ */
      doc.setDrawColor(...brandGreen);
      doc.setLineWidth(1.2);
      doc.line(0, 38, pageW, 38);

      /* ═══ Patient info card ═══ */
      const cardY = 44;
      doc.setFillColor(245, 248, 252);
      doc.roundedRect(m, cardY, pageW - m * 2, 28, 3, 3, "F");
      doc.setDrawColor(220, 228, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(m, cardY, pageW - m * 2, 28, 3, 3, "S");

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("DADOS DO PACIENTE", m + 4, cardY + 5);

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`Nome: ${userInfo.nome}`, m + 4, cardY + 12);
      doc.text(`Idade: ${userInfo.idade}`, m + 4, cardY + 18);
      doc.text(`Gênero: ${userInfo.genero}`, m + 4, cardY + 24);

      const col2X = pageW / 2;
      doc.text(`Mão dominante: ${userInfo.maoDominante}`, col2X, cardY + 12);
      doc.text(`Peso: ${userInfo.peso}`, col2X, cardY + 18);
      doc.text(`Altura: ${userInfo.altura}`, col2X, cardY + 24);

      let tableStartY = cardY + 34;

      /* ═══ Table — dados reais ═══ */
      const headStyles = {
        fillColor: brandDark,
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 9,
        fontStyle: "bold" as const,
        halign: "center" as const,
      };
      const bodyStyles = {
        fontSize: 8.5,
        halign: "center" as const,
        cellPadding: 3,
      };
      const altRowColor: [number, number, number] = [245, 248, 252];

      // Monta tabela a partir dos resultados reais filtrados
      const body: any[][] = [];
      filteredResults.forEach(r => {
        const d = new Date(r.examDate);
        const dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
        const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

        if (type === "palmar") {
          const dirVal = r.palmMaxD != null ? r.palmMaxD.toFixed(1) : "--";
          const esqVal = r.palmMaxE != null ? r.palmMaxE.toFixed(1) : "--";
          let analise = "";
          if (r.palmMaxD != null && r.palmMaxE != null) {
            analise = diffColor(r.palmMaxD, r.palmMaxE).label;
          }
          body.push([dateStr, timeStr, dirVal, esqVal, analise]);
        } else {
          // Pinça: uma linha com todos os dedos da mão selecionada
          const fingerMap: { key: PincaSub; label: string; dField: keyof ResultResponse; eField: keyof ResultResponse }[] = [
            { key: "indicador", label: "Indicador", dField: "pinchMaxD1", eField: "pinchMaxE1" },
            { key: "medio", label: "Médio", dField: "pinchMaxD2", eField: "pinchMaxE2" },
            { key: "anelar", label: "Anelar", dField: "pinchMaxD3", eField: "pinchMaxE3" },
            { key: "minimo", label: "Mínimo", dField: "pinchMaxD4", eField: "pinchMaxE4" },
          ];
          fingerMap.forEach(f => {
            const dirVal = r[f.dField] as number | null;
            const esqVal = r[f.eField] as number | null;
            if (dirVal != null || esqVal != null) {
              let analise = "";
              if (dirVal != null && esqVal != null) analise = diffColor(dirVal, esqVal).label;
              body.push([dateStr, f.label, dirVal != null ? dirVal.toFixed(1) : "--", esqVal != null ? esqVal.toFixed(1) : "--", analise]);
            }
          });
        }
      });

      if (body.length === 0) {
        body.push(["--", "--", "--", "--", "Sem dados no período"]);
      }

      const tableHead = type === "palmar"
        ? [["Data", "Hora", "Direita (kgf)", "Esquerda (kgf)", "Análise"]]
        : [["Data", "Dedo", "Direita (kgf)", "Esquerda (kgf)", "Análise"]];

      autoTable(doc, {
        head: tableHead,
        body,
        startY: tableStartY,
        margin: { left: m, right: m },
        headStyles,
        bodyStyles,
        alternateRowStyles: { fillColor: altRowColor },
      });

      /* ═══ Footer ═══ */
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(...brandGreen);
      doc.setLineWidth(0.8);
      doc.line(m, pageH - 16, pageW - m, pageH - 16);
      doc.setFontSize(7);
      doc.setTextColor(140, 150, 170);
      doc.text("Relatório gerado automaticamente pelo app Dyna Tech", m, pageH - 10);
      doc.text(`${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}`, pageW - m, pageH - 10, { align: "right" });

      /* ═══ Legend ═══ */
      const legendY = (doc as any).lastAutoTable?.finalY + 8 || tableStartY + 60;
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Legenda de cores:", m, legendY);
      doc.setFillColor(220, 38, 38);  doc.circle(m + 2, legendY + 5, 1.5, "F"); doc.text("Vermelho: diferença > 20% — desbalanço significativo", m + 6, legendY + 6);
      doc.setFillColor(202, 138, 4);   doc.circle(m + 2, legendY + 10, 1.5, "F"); doc.text("Amarelo: diferença entre 10% e 20% — atenção", m + 6, legendY + 11);
      doc.setFillColor(0, 128, 0);     doc.circle(m + 2, legendY + 15, 1.5, "F"); doc.text("Verde: diferença < 10% — musculaturas equilibradas", m + 6, legendY + 16);

      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const typeStr = type === "palmar" ? "Palmar" : "Pinca";
      const fileName = `DynaTech_${typeStr}_${fileSuffix}.pdf`;
      const savedFile = await Filesystem.writeFile({ path: fileName, data: pdfBase64, directory: Directory.Cache });
      await Share.share({ title: "Exportar Relatório PDF", url: savedFile.uri, dialogTitle: "Salvar ou compartilhar relatório" });
    } catch (e) {
      console.error("Erro ao exportar PDF", e);
    }
  }

  async function exportToXLSX() {
    try {
      let fileSuffix = `${range}dias`;
      let sheetName = `Histórico ${range} dias`;
      if (range === "custom") { fileSuffix = "Personalizado"; sheetName = "Personalizado"; }

      /* Cabeçalho do usuário */
      const header = [
        ["Relatório DynaTech"],
        [`Nome: ${userInfo.nome}`, `Idade: ${userInfo.idade}`, `Gênero: ${userInfo.genero}`],
        [`Mão dominante: ${userInfo.maoDominante}`, `Peso: ${userInfo.peso}`, `Altura: ${userInfo.altura}`],
        [],
      ];

      // Monta linhas a partir dos dados reais filtrados
      const rows: any[][] = [];

      if (type === "palmar") {
        rows.push(["Data", "Hora", "Direita (kgf)", "Esquerda (kgf)", "Análise"]);
        filteredResults.forEach(r => {
          const d = new Date(r.examDate);
          const dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
          const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          const dirVal = r.palmMaxD != null ? r.palmMaxD.toFixed(1) : "--";
          const esqVal = r.palmMaxE != null ? r.palmMaxE.toFixed(1) : "--";
          let analise = "";
          if (r.palmMaxD != null && r.palmMaxE != null) {
            analise = diffColor(r.palmMaxD, r.palmMaxE).label;
          }
          rows.push([dateStr, timeStr, dirVal, esqVal, analise]);
        });
      } else {
        /* Pinça: para cada resultado, mostra todos os dedos com dados */
        rows.push(["Data", "Dedo", "Direita (kgf)", "Esquerda (kgf)", "Análise"]);
        const fingerMap: { key: PincaSub; label: string; dField: keyof ResultResponse; eField: keyof ResultResponse }[] = [
          { key: "indicador", label: "Indicador", dField: "pinchMaxD1", eField: "pinchMaxE1" },
          { key: "medio", label: "Médio", dField: "pinchMaxD2", eField: "pinchMaxE2" },
          { key: "anelar", label: "Anelar", dField: "pinchMaxD3", eField: "pinchMaxE3" },
          { key: "minimo", label: "Mínimo", dField: "pinchMaxD4", eField: "pinchMaxE4" },
        ];
        filteredResults.forEach(r => {
          const d = new Date(r.examDate);
          const dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
          fingerMap.forEach(f => {
            const dirVal = r[f.dField] as number | null;
            const esqVal = r[f.eField] as number | null;
            if (dirVal != null || esqVal != null) {
              let analise = "";
              if (dirVal != null && esqVal != null) analise = diffColor(dirVal, esqVal).label;
              rows.push([dateStr, f.label, dirVal != null ? dirVal.toFixed(1) : "--", esqVal != null ? esqVal.toFixed(1) : "--", analise]);
            }
          });
        });
      }

      if (rows.length <= 1) {
        rows.push(["--", "--", "--", "--", "Sem dados no período"]);
      }

      const worksheetData = [...header, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const xlsxBase64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const typeStr = type === "palmar" ? "Palmar" : "Pinca";
      const fileName = `DynaTech_${typeStr}_${fileSuffix}.xlsx`;
      const savedFile = await Filesystem.writeFile({ path: fileName, data: xlsxBase64, directory: Directory.Cache });
      await Share.share({ title: "Exportar Tabela XLSX", url: savedFile.uri, dialogTitle: "Salvar ou compartilhar tabela" });
    } catch (e) {
      console.error("Erro ao exportar XLSX", e);
    }
  }

  return (
    <div
      className="min-h-full w-full"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="px-6 pt-6 animate-fadeSlideDown">
        <h1 style={{ color: "var(--brand-text)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Histórico
        </h1>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
          Sua evolução ao longo do tempo
        </p>

        {/* Tipo Toggle */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setType("palmar")}
            className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm"
            style={{
              background: type === "palmar" ? accentColor : "var(--brand-chip-bg)",
              color: type === "palmar" ? "#fff" : "var(--brand-text-muted)",
            }}
          >
            Preensão Palmar
          </button>
          <button
            onClick={() => setType("pinca")}
            className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm"
            style={{
              background: type === "pinca" ? accentColor : "var(--brand-chip-bg)",
              color: type === "pinca" ? "#fff" : "var(--brand-text-muted)",
            }}
          >
            Força de Pinça
          </button>
        </div>

        {/* Sub-type chips */}
        {type === "palmar" ? (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {PALMAR_SUBS.map((s) => (
              <button
                key={s.key}
                onClick={() => setPalmarSub(s.key)}
                className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: palmarSub === s.key ? accentSoft : "var(--brand-chip-bg)",
                  color: palmarSub === s.key ? accentColor : "var(--brand-text-muted)",
                  border: palmarSub === s.key ? `1.5px solid ${accentColor}` : "1.5px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Hand selector */}
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {PINCA_HANDS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPincaHand(s.key)}
                  className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: pincaHand === s.key ? accentSoft : "var(--brand-chip-bg)",
                    color: pincaHand === s.key ? accentColor : "var(--brand-text-muted)",
                    border: pincaHand === s.key ? `1.5px solid ${accentColor}` : "1.5px solid transparent",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* Finger selector */}
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
              {PINCA_SUBS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPincaSub(s.key)}
                  className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: pincaSub === s.key ? "var(--brand-chip-bg)" : "transparent",
                    color: pincaSub === s.key ? accentColor : "var(--brand-text-muted)",
                    border: pincaSub === s.key ? `1.5px solid ${accentColor}` : "1.5px solid var(--brand-border-soft)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
        <div
          className="flex p-1 rounded-xl mt-4"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          {(["15", "30", "60", "custom"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="flex-1 py-2 rounded-lg transition-all duration-200"
              style={{
                background: range === r ? "var(--brand-card)" : "transparent",
                color:
                  range === r ? "var(--brand-text)" : "var(--brand-text-muted)",
                fontSize: 13,
                fontWeight: 600,
                boxShadow:
                  range === r ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {r === "custom" ? "Período" : `${r} dias`}
            </button>
          ))}
        </div>

        {/* Date Pickers for Custom Range */}
        {range === "custom" && (
          <div className="flex gap-3 mt-3 animate-fadeSlideDown">
            <div className="flex-1">
              <label style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600 }}>INÍCIO</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                style={{ background: "var(--brand-card)", color: "var(--brand-text)", border: "1px solid var(--brand-border-soft)", fontSize: 14 }}
              />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600 }}>FIM</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                style={{ background: "var(--brand-card)", color: "var(--brand-text)", border: "1px solid var(--brand-border-soft)", fontSize: 14 }}
              />
            </div>
          </div>
        )}

        <div
          className="mt-5 rounded-2xl p-4 shadow-sm animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>
                MÉDIA NO PERÍODO
              </div>
              <div style={{ color: "var(--brand-text)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {average.toFixed(1)}{" "}
                <span style={{ fontSize: 14, color: "var(--brand-text-muted)", fontWeight: 500 }}>
                  kgf
                </span>
              </div>
            </div>
            <span
              className="rounded-full px-2 py-1"
              style={{
                background: accentSoft,
                color: accentColor,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              +5.8%
            </span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: tick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: tick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const formattedLabel = String(label).replace("S", "Semana ").replace("D", "Dia ");
                      return (
                        <div
                          style={{
                            background: "var(--brand-card)",
                            border: "1px solid var(--brand-border-soft)",
                            borderRadius: 8,
                            padding: "8px 12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600, letterSpacing: "0.02em" }}>
                            {formattedLabel.toUpperCase()}
                          </p>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: accentColor, marginTop: 2 }}>
                            {Number(payload[0].value).toFixed(1)} kgf
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: accentColor }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex gap-3 mt-5 mb-2 animate-fadeSlideUp" style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={exportToPDF}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm"
            style={{ background: "#EF4444", color: "#fff", fontWeight: 600, fontSize: 14 }}
          >
            <FileText size={18} />
            Exportar PDF
          </button>
          <button 
            onClick={exportToXLSX}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm"
            style={{ background: "#10B981", color: "#fff", fontWeight: 600, fontSize: 14 }}
          >
            <Table size={18} />
            Exportar Tabela
          </button>
        </div>

        <h3
          style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}
          className="mt-6 mb-3"
        >
          Medições recentes
        </h3>

        <div className="space-y-2 pb-6">
          {list.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3 animate-fadeSlideUp"
              style={{
                background: "var(--brand-card)",
                border: "1px solid var(--brand-border-soft)",
                animationDelay: `${0.1 * i}s`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--brand-chip-bg)" }}
                >
                  <span style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 700 }}>
                    {item.date}
                  </span>
                </div>
                <div>
                  <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>
                    {item.label}
                  </div>
                  <div style={{ color: "var(--brand-text-faint)", fontSize: 12 }}>
                    {item.time}
                  </div>
                </div>
              </div>
              <div style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>
                {Number(item.value).toFixed(1)}{" "}
                <span style={{ fontSize: 11, color: "var(--brand-text-muted)" }}>kgf</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
