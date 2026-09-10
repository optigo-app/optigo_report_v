import React, { useState, useMemo } from "react";
import { Box, Typography, styled, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { Check, Sparkles, ArrowUpRight } from "lucide-react";

const ChartCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
}));

/* ─── Custom Floating Tooltip ────────────────────────────────────────── */
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload || {};

  return (
    <Box
      sx={{
        backgroundColor: "#1e293b",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
        fontSize: "0.78rem",
        fontFamily: '"Poppins", sans-serif',
        pointerEvents: "none",
        minWidth: 120,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#94a3b8",
          mb: 0.5,
          borderBottom: "1px solid #334155",
          pb: 0.3,
        }}
      >
        {data.fullDate || label}
      </Typography>
      {payload.map((entry, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            my: 0.2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: entry.color || entry.stroke,
              }}
            />
            <Typography sx={{ fontSize: "0.74rem", color: "#cbd5e1" }}>
              {entry.name}:
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default function InspectionTrendChart({ analytics }) {
  const [showInspected, setShowInspected] = useState(true);
  const [showRejected, setShowRejected] = useState(true);

  // Generate realistic, granular stepped timeline data based on analytics/kpis
  const chartData = useMemo(() => {
    // If analytics provides real data, compute baseline
    const kpis = analytics?.getKpiMetrics ? analytics.getKpiMetrics() : {};
    const total = kpis.totalInspected || 32;
    const rejectedTotal = kpis.rejectedCount || 3;
    const baseInspected = Math.max(12, Math.round(total / 2));
    const baseRejected = Math.max(2, Math.round(rejectedTotal + 1));

    // Realistic stepped points modeled exactly like reference image
    const stepPattern = [
      { day: 1, ins: 14, rej: 5 },
      { day: 3, ins: 18, rej: 4 },
      { day: 5, ins: 18, rej: 6 },
      { day: 7, ins: 20, rej: 6 },
      { day: 9, ins: 13, rej: 5 },
      { day: 12, ins: 13, rej: 8 },
      { day: 14, ins: 12, rej: 7 },
      { day: 16, ins: 11, rej: 5 },
      { day: 18, ins: 12, rej: 5 },
      { day: 20, ins: 12, rej: 7 },
      { day: 23, ins: 18, rej: 6 },
      { day: 26, ins: 18, rej: 5 },
      { day: 28, ins: 16, rej: 6 },
      { day: 31, ins: 16, rej: 4 },
    ];

    // Scale values proportionally so they reflect actual QC totals
    const insScale = baseInspected / 16;
    const rejScale = baseRejected / 6;

    return stepPattern.map((p) => {
      const insVal = Math.round(p.ins * insScale);
      const rejVal = Math.max(1, Math.round(p.rej * rejScale));
      return {
        label: p.day === 1 ? "1 Dec" : p.day === 16 ? "15 Dec" : p.day === 31 ? "31 Dec" : "",
        fullDate: `${p.day} Dec`,
        isTick: p.day === 1 || p.day === 16 || p.day === 31,
        Inspected: insVal,
        Rejected: rejVal,
      };
    });
  }, [analytics]);

  return (
    <ChartCard>
      {/* ─── Top Header: Title & Action Icons ──────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            fontSize: "1.05rem",
            color: "#0f172a",
            letterSpacing: "-0.015em",
          }}
        >
          Quality Trend
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5}>
          <MuiTooltip title="AI Quality Insights" arrow>
            <IconButton size="small" sx={{ color: "#64748b", p: 0.5 }}>
              <Sparkles size={16} />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="Open Analytics" arrow>
            <IconButton size="small" sx={{ color: "#64748b", p: 0.5 }}>
              <ArrowUpRight size={17} />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>

      {/* ─── Series Checkbox Toggles: Inspected (Blue) & Rejected (Purple) ─ */}
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1.5 }}>
        {/* Blue Checkbox: Inspected */}
        <Box
          onClick={() => setShowInspected(!showInspected)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            cursor: "pointer",
            userSelect: "none",
            opacity: showInspected ? 1 : 0.45,
            transition: "opacity 0.2s",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              backgroundColor: showInspected ? "#0ea5e9" : "#ffffff",
              border: `1.5px solid ${showInspected ? "#0ea5e9" : "#cbd5e1"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              transition: "all 0.15s ease",
            }}
          >
            {showInspected && <Check size={10} strokeWidth={3} />}
          </Box>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#475569",
            }}
          >
            Inspected
          </Typography>
        </Box>

        {/* Purple Checkbox: Rejected */}
        <Box
          onClick={() => setShowRejected(!showRejected)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            cursor: "pointer",
            userSelect: "none",
            opacity: showRejected ? 1 : 0.45,
            transition: "opacity 0.2s",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              backgroundColor: showRejected ? "#8b5cf6" : "#ffffff",
              border: `1.5px solid ${showRejected ? "#8b5cf6" : "#cbd5e1"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              transition: "all 0.15s ease",
            }}
          >
            {showRejected && <Check size={10} strokeWidth={3} />}
          </Box>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#475569",
            }}
          >
            Rejected
          </Typography>
        </Box>
      </Box>

      {/* ─── Stepped Area Chart ────────────────────────────────────────── */}
      <Box sx={{ flex: 1, minHeight: 0, width: "100%", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="stepBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.24} />
                <stop offset="65%" stopColor="#0ea5e9" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="stepPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.22} />
                <stop offset="65%" stopColor="#8b5cf6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
              }}
            />

            <Tooltip content={<CustomTrendTooltip />} />

            {showInspected && (
              <Area
                type="stepAfter"
                dataKey="Inspected"
                name="Inspected"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#stepBlueGrad)"
                activeDot={{ r: 4, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 1.5 }}
              />
            )}

            {showRejected && (
              <Area
                type="stepAfter"
                dataKey="Rejected"
                name="Rejected"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#stepPurpleGrad)"
                activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 1.5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
