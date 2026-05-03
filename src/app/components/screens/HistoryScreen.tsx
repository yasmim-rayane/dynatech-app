import { useState } from "react";
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
import { useTheme } from "../../contexts/ThemeContext";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ForceType = "palmar" | "pinca";

const mockData: Record<ForceType, Record<string, { name: string; v: number }[]>> = {
  palmar: {
    "15": [
      { name: "D1", v: 38 }, { name: "D3", v: 39 }, { name: "D5", v: 41 },
      { name: "D7", v: 40 }, { name: "D9", v: 42 }, { name: "D11", v: 43 },
      { name: "D13", v: 41.5 }, { name: "D15", v: 44 },
    ],
    "30": [
      { name: "D1", v: 35 }, { name: "D5", v: 37 }, { name: "D10", v: 39 },
      { name: "D15", v: 40 }, { name: "D20", v: 42 }, { name: "D25", v: 41 },
      { name: "D30", v: 44 },
    ],
    "60": [
      { name: "S1", v: 33 }, { name: "S2", v: 35 }, { name: "S3", v: 37 },
      { name: "S4", v: 39 }, { name: "S5", v: 41 }, { name: "S6", v: 42 },
      { name: "S7", v: 43 }, { name: "S8", v: 44.5 },
    ],
    "custom": [
      { name: "P1", v: 36 }, { name: "P2", v: 38 }, { name: "P3", v: 39 },
      { name: "P4", v: 41 }, { name: "P5", v: 43 },
    ],
  },
  pinca: {
    "15": [
      { name: "D1", v: 7.5 }, { name: "D3", v: 7.8 }, { name: "D5", v: 8.0 },
      { name: "D7", v: 8.1 }, { name: "D9", v: 8.4 }, { name: "D11", v: 8.3 },
      { name: "D13", v: 8.5 }, { name: "D15", v: 8.8 },
    ],
    "30": [
      { name: "D1", v: 7.0 }, { name: "D5", v: 7.5 }, { name: "D10", v: 7.8 },
      { name: "D15", v: 8.2 }, { name: "D20", v: 8.4 }, { name: "D25", v: 8.7 },
      { name: "D30", v: 9.0 },
    ],
    "60": [
      { name: "S1", v: 6.5 }, { name: "S2", v: 6.8 }, { name: "S3", v: 7.1 },
      { name: "S4", v: 7.5 }, { name: "S5", v: 7.9 }, { name: "S6", v: 8.2 },
      { name: "S7", v: 8.5 }, { name: "S8", v: 8.9 },
    ],
    "custom": [
      { name: "P1", v: 7.0 }, { name: "P2", v: 7.4 }, { name: "P3", v: 7.9 },
      { name: "P4", v: 8.2 }, { name: "P5", v: 8.5 },
    ],
  }
};

const fullList = [
  { date: "26/04", time: "14:32", type: "palmar", label: "Preensão", value: 42.5 },
  { date: "25/04", time: "08:10", type: "pinca", label: "Pinça", value: 8.4 },
  { date: "24/04", time: "19:40", type: "palmar", label: "Preensão", value: 41.8 },
  { date: "23/04", time: "07:52", type: "palmar", label: "Preensão", value: 40.9 },
  { date: "22/04", time: "09:15", type: "pinca", label: "Pinça", value: 8.1 },
  { date: "20/04", time: "18:30", type: "pinca", label: "Pinça", value: 7.9 },
];

export function HistoryScreen() {
  const [type, setType] = useState<ForceType>("palmar");
  const [range, setRange] = useState<"15" | "30" | "60" | "custom">("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { theme } = useTheme();
  
  const grid = theme === "dark" ? "#1F2A44" : "#E2E8F0";
  const tick = theme === "dark" ? "#94A3B8" : "#94A3B8";
  
  // Cores dinâmicas para o tipo de força
  const accentColor = type === "palmar" ? "var(--brand-emerald)" : "var(--brand-cyan)";
  const accentSoft = type === "palmar" ? "var(--brand-emerald-soft)" : "var(--brand-cyan-soft)";
  
  const currentData = mockData[type][range];
  const list = fullList.filter(item => item.type === type);
  
  // Calcular média dinamicamente
  const average = currentData.reduce((acc, curr) => acc + curr.v, 0) / currentData.length;
  
  const typeLabel = type === "palmar" ? "Força Palmar" : "Força de Pinça";

  async function exportToPDF() {
    try {
      const doc = new jsPDF();
      
      let titleSuffix = `${range} dias`;
      let fileSuffix = `${range}dias`;
      
      if (range === "custom") {
        const startStr = startDate ? startDate.split("-").reverse().join("/") : "Início";
        const endStr = endDate ? endDate.split("-").reverse().join("/") : "Fim";
        titleSuffix = `Personalizado (${startStr} a ${endStr})`;
        fileSuffix = `Personalizado`;
      }
      
      doc.text(`Relatório DynaTech - ${typeLabel} - ${titleSuffix}`, 14, 15);
      
      const tableData = currentData.map((d) => [d.name, d.v]);
      
      autoTable(doc, {
        head: [['Período', 'Força (kgf)']],
        body: tableData,
        startY: 25,
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const typeStr = type === "palmar" ? "Palmar" : "Pinca";
      const fileName = `DynaTech_${typeStr}_${fileSuffix}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Exportar Relatório PDF',
        url: savedFile.uri,
        dialogTitle: 'Salvar ou compartilhar relatório',
      });
    } catch (e) {
      console.error('Erro ao exportar PDF', e);
    }
  }

  async function exportToXLSX() {
    try {
      let fileSuffix = `${range}dias`;
      let sheetName = `Histórico ${range} dias`;
      
      if (range === "custom") {
        fileSuffix = `Personalizado`;
        sheetName = `Personalizado`;
      }
      
      const worksheetData = [['Período', 'Força (kgf)'], ...currentData.map(d => [d.name, d.v])];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const xlsxBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const typeStr = type === "palmar" ? "Palmar" : "Pinca";
      const fileName = `DynaTech_${typeStr}_${fileSuffix}.xlsx`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: xlsxBase64,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Exportar Tabela XLSX',
        url: savedFile.uri,
        dialogTitle: 'Salvar ou compartilhar tabela',
      });
    } catch (e) {
      console.error('Erro ao exportar XLSX', e);
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

        {/* Período Toggle */}
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
