import React from "react";
import { Box, Typography, Paper, styled } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

const ChartCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
}));

// Per-category palette: soft fill for PASSED, more visible for REJECTED, accent top line
const CATEGORY_PALETTES = [
  {
    accent: "#ef4444",
    passFill: "rgba(239, 68, 68, 0.08)",
    rejFill: "rgba(239, 68, 68, 0.38)",
    pill: "rgba(239, 68, 68, 0.12)",
    pillText: "#dc2626",
  },
  {
    accent: "#818cf8",
    passFill: "rgba(129, 140, 248, 0.09)",
    rejFill: "rgba(129, 140, 248, 0.40)",
    pill: "rgba(129, 140, 248, 0.14)",
    pillText: "#6366f1",
  },
  {
    accent: "#22c55e",
    passFill: "rgba(34, 197, 94, 0.08)",
    rejFill: "rgba(34, 197, 94, 0.38)",
    pill: "rgba(34, 197, 94, 0.12)",
    pillText: "#16a34a",
  },
  {
    accent: "#f59e0b",
    passFill: "rgba(245, 158, 11, 0.09)",
    rejFill: "rgba(245, 158, 11, 0.40)",
    pill: "rgba(245, 158, 11, 0.14)",
    pillText: "#d97706",
  },
  {
    accent: "#60a5fa",
    passFill: "rgba(96, 165, 250, 0.09)",
    rejFill: "rgba(96, 165, 250, 0.38)",
    pill: "rgba(96, 165, 250, 0.14)",
    pillText: "#2563eb",
  },
  {
    accent: "#a78bfa",
    passFill: "rgba(167, 139, 250, 0.09)",
    rejFill: "rgba(167, 139, 250, 0.38)",
    pill: "rgba(167, 139, 250, 0.14)",
    pillText: "#7c3aed",
  },
];

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, sortedData }) => {
  if (!active || !payload || !payload.length) return null;
  const item =
    sortedData?.find((c) => c.category === payload[0]?.payload?.category) ||
    payload[0]?.payload ||
    {};
  const pal =
    CATEGORY_PALETTES[(item.paletteIdx || 0) % CATEGORY_PALETTES.length];

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
        minWidth: 160,
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        color="#0f172a"
        mb={0.5}
        sx={{ fontSize: "0.82rem" }}
      >
        {item.category} — {item.total} pcs
      </Typography>

      {/* Passed row */}
      <Box display="flex" justifyContent="space-between" gap={2} mb={0.25}>
        <Box display="flex" alignItems="center" gap={0.7}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: 1,
              bgcolor: pal.accent,
              opacity: 0.35,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Passed
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color="#0f172a">
          {item.passed} pcs ({item.passRate}%)
        </Typography>
      </Box>

      {/* Rejected row */}
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={0.7}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: 1,
              bgcolor: pal.accent,
              opacity: 0.85,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Rejected
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color={pal.pillText}>
          {item.rejected} pcs ({item.rejectionRate}%)
        </Typography>
      </Box>
    </Box>
  );
};

/* ─── PASSED bar shape (bottom layer) ────────────────────────── */
const PassedShape = (props) => {
  const { x, y, width, height, paletteIdx } = props;
  if (!height || height <= 0 || !width) return null;
  const pal = CATEGORY_PALETTES[(paletteIdx || 0) % CATEGORY_PALETTES.length];
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={pal.passFill}
      rx={4}
      ry={4}
    />
  );
};

/* ─── REJECTED bar shape (top layer) ─────────────────────────── */
const RejectedShape = (props) => {
  const { x, y, width, height, paletteIdx, passRate } = props;
  if (!width) return null;
  const pal = CATEGORY_PALETTES[(paletteIdx || 0) % CATEGORY_PALETTES.length];

  // Even if rejected height is 0, still render the % label above the bar
  const hasRejected = height && height > 0;

  return (
    <g>
      {hasRejected && (
        <>
          {/* Rejected fill */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={pal.rejFill}
            rx={2}
            ry={2}
          />
          {/* Accent top line */}
          <rect
            x={x}
            y={y}
            width={width}
            height={3}
            fill={pal.accent}
            rx={1.5}
            ry={1.5}
          />
        </>
      )}

      {/* Pass % label — always above the total combined bar */}
      <text
        x={x + width / 2}
        y={y - 8}
        textAnchor="middle"
        fill="#0f172a"
        fontSize={13}
        fontWeight={800}
        fontFamily="inherit"
      >
        {passRate}%
      </text>
    </g>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const CategoryQCChart = ({ categoryData }) => {
  const sortedData = [...(categoryData || [])].sort(
    (a, b) => b.total - a.total
  );

  const chartData = sortedData.map((item, idx) => ({
    ...item,
    paletteIdx: idx,
  }));

  return (
    <ChartCard elevation={0}>
      {/* ── Header ── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1}
        flexShrink={0}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={900}
            color="#0f172a"
            sx={{     fontSize: "1.25rem",lineHeight: 1.2, letterSpacing: "-0.015em" }}
          >
            QC results by jewellery category
          </Typography>
          <Typography
            variant="caption"
            color="#64748b"
            sx={{ fontSize: "0.76rem", display: "block", mt: 0.3, fontWeight: 500 }}
          >
            Accepted and rejected pieces per category.
          </Typography>
        </Box>

        {/* Legend */}
        <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
          <Box display="flex" alignItems="center" gap={0.8}>
            <Box
              sx={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                bgcolor: "#818cf8",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#475569",
                lineHeight: 1,
              }}
            >
              Passed
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.8}>
            <Box
              sx={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                bgcolor: "#4338ca",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#475569",
                lineHeight: 1,
              }}
            >
              Rejected
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Chart ── */}
      <Box flex={1} minHeight={0} width="100%">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap="3%"
            barGap={0}
            margin={{ top: 28, right: 10, left: 5, bottom: 10 }}
          >
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={44}
              tick={({ x, y, payload, index }) => {
                const item = chartData[index] || {};
                const paletteIdx =
                  item.paletteIdx !== undefined ? item.paletteIdx : index;
                const pal =
                  CATEGORY_PALETTES[paletteIdx % CATEGORY_PALETTES.length];
                return (
                  <g transform={`translate(${x},${y})`}>
                    {/* Rejection pill */}
                    <rect
                      x={-22}
                      y={2}
                      width={50}
                      height={20}
                      rx={7.5}
                      fill={pal.pill}
                    />
                    <text
                      x={1}
                      y={16}
                      textAnchor="middle"
                      fill={pal.pillText}
                 fontSize={14}
                      fontWeight={700}
                    >
                      ↓{item.rejectionRate || 0}%
                    </text>
                    {/* Category name */}
                    <text
                      x={0}
                      y={40}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize={11}
                      fontWeight={600}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />

            <Tooltip
              content={<CustomTooltip sortedData={sortedData} />}
              cursor={{ fill: "rgba(148,163,184,0.06)" }}
            />

            {/* ── PASSED — bottom layer ── */}
            <Bar
              dataKey="passed"
              stackId="qc"
              maxBarSize={999}
              shape={(shapeProps) => {
                const item = chartData[shapeProps.index] || {};
                return (
                  <PassedShape
                    {...shapeProps}
                    paletteIdx={item.paletteIdx ?? shapeProps.index}
                  />
                );
              }}
            >
              {chartData.map((_, i) => (
                <Cell key={`pass-${i}`} />
              ))}
            </Bar>

            {/* ── REJECTED — top layer ── */}
            <Bar
              dataKey="rejected"
              stackId="qc"
              maxBarSize={999}
              shape={(shapeProps) => {
                const item = chartData[shapeProps.index] || {};
                return (
                  <RejectedShape
                    {...shapeProps}
                    paletteIdx={item.paletteIdx ?? shapeProps.index}
                    passRate={item.passRate || 0}
                  />
                );
              }}
            >
              {chartData.map((_, i) => (
                <Cell key={`rej-${i}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
};

export default CategoryQCChart;
