import React, { useState, useMemo } from "react";
import { Box, Typography, styled } from "@mui/material";
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

// Trend Chart colors: Blue (Accepted) & Amber (Rejected)
const QC_COLORS = {
  passed: {
    fill: "rgba(59, 130, 246, 0.18)",
    hover: "rgba(59, 130, 246, 0.32)",
    solid: "#3b82f6",
    text: "#2563eb",
  },
  rejected: {
    fill: "rgba(245, 158, 11, 0.88)",
    hover: "#d97706",
    solid: "#f59e0b",
    text: "#d97706",
  },
};

/* ─── Floating Dark Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload || {};

  if (!data.hasData || data.total === 0) {
    return (
      <Box
        sx={{
          backgroundColor: "#1e293b",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "6px 10px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
          fontSize: "0.78rem",
          position: "relative",
          pointerEvents: "none",
          textAlign: "center",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -5,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #1e293b",
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.82rem",
            display: "block",
          }}
        >
          {data.fullLabel || data.label || data.month}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#94a3b8", fontSize: "0.72rem" }}
        >
          No inspections recorded
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#1e293b",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
        fontSize: "0.78rem",
        position: "relative",
        minWidth: 145,
        pointerEvents: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid #1e293b",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={0.8} mb={0.3}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: data.rejectionRate > 0 ? QC_COLORS.rejected.solid : QC_COLORS.passed.solid,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.86rem",
            lineHeight: 1.2,
          }}
        >
          {data.rejectionRate || 0}% Rejection
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "#94a3b8", fontSize: "0.72rem", display: "block" }}
      >
        {data.fullLabel || data.label || data.month} • {data.total || 0} pcs inspected
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        gap={1.5}
        mt={0.4}
        pt={0.4}
        sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#60a5fa", fontSize: "0.7rem", fontWeight: 600 }}
        >
          {data.passed || 0} Passed ({data.passRate || 0}%)
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#fbbf24", fontSize: "0.7rem", fontWeight: 600 }}
        >
          {data.rejected || 0} Rejected
        </Typography>
      </Box>
    </Box>
  );
};

/* ─── PASSED bar shape (bottom layer — Green) ────────────────── */
const PassedShape = (props) => {
  const { x, y, width, height, payload, index, activeIndex } = props;
  const hasData = payload?.hasData && payload?.total > 0;
  const isHovered = index === activeIndex;

  // If empty month, draw subtle baseline indicator
  if (!hasData) {
    return (
      <rect
        x={x + (width - Math.min(width, 14)) / 2}
        y={y - 2}
        width={Math.min(width, 14)}
        height={2.5}
        fill={isHovered ? "#94a3b8" : "#e2e8f0"}
      />
    );
  }

  if (!height || height <= 0) return null;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isHovered ? QC_COLORS.passed.hover : QC_COLORS.passed.fill}
    />
  );
};

/* ─── REJECTED bar shape (top layer — Red) ───────────────────── */
const RejectedShape = (props) => {
  const { x, y, width, height, payload, index, activeIndex } = props;
  const hasData = payload?.hasData && payload?.total > 0;
  if (!hasData || !width) return null;

  const isHovered = index === activeIndex;
  const hasRejected = height && height > 0;

  return (
    <g>
      {hasRejected && (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isHovered ? QC_COLORS.rejected.hover : QC_COLORS.rejected.fill}
        />
      )}

      {/* Pass % label above the combined bar */}
      {!isHovered && (
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={11.5}
          fontWeight={800}
        >
          {payload?.passRate || 0}%
        </text>
      )}
    </g>
  );
};

const MonthlyTrendChart = ({ monthlyData, analytics }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [viewMode, setViewMode] = useState("month");

  const trendData = useMemo(() => {
    if (analytics && typeof analytics.getTrendData === "function") {
      return analytics.getTrendData(viewMode);
    }
    return monthlyData || [];
  }, [analytics, monthlyData, viewMode]);

  const currentMode =
    trendData[0]?.mode || (viewMode === "day" ? "day" : "month");

  return (
    <ChartCard elevation={0}>
      {/* ── Header with Title, Legend & Day/Month Toggle ── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1}
        flexShrink={0}
      >
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={900}
            color="#0f172a"
            sx={{ fontSize: "1.25rem", lineHeight: 1.2, letterSpacing: "-0.015em" }}
          >
            Rejection trend
          </Typography>
          <Typography
            variant="caption"
            color="#64748b"
            sx={{ fontSize: "0.76rem", display: "block", mt: 0.3, fontWeight: 500 }}
          >
            {currentMode === "day" ? "Daily" : "All 12 months"} inspection performance.
          </Typography>
        </Box>

        {/* Legend & Day / Month Switch */}
        <Box display="flex" alignItems="center" gap={2.5} flexShrink={0}>
          {/* Legend */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box
                sx={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  bgcolor: QC_COLORS.passed.solid,
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
                  bgcolor: QC_COLORS.rejected.solid,
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

          {/* Segmented Switch */}
          <Box
            sx={{
              display: "inline-flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              p: "2px",
            }}
          >
            <Box
              onClick={() => setViewMode("day")}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: currentMode === "day" ? 700 : 500,
                cursor: "pointer",
                color: currentMode === "day" ? "#0f172a" : "#64748b",
                backgroundColor: currentMode === "day" ? "#ffffff" : "transparent",
                boxShadow:
                  currentMode === "day" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              Day
            </Box>
            <Box
              onClick={() => setViewMode("month")}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: currentMode === "month" ? 700 : 500,
                cursor: "pointer",
                color: currentMode === "month" ? "#0f172a" : "#64748b",
                backgroundColor:
                  currentMode === "month" ? "#ffffff" : "transparent",
                boxShadow:
                  currentMode === "month"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              Month
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Vertical Stacked Bar Chart ── */}
      <Box flex={1} minHeight={0} width="100%">
        {trendData.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="caption" color="text.secondary">
              No trend data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              barCategoryGap="3%"
              barGap={0}
              margin={{ top: 22, right: 6, left: 6, bottom: 4 }}
              onMouseMove={(state) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{
                  fill: "#64748b",
                  fontSize: currentMode === "month" ? 9.5 : 10.5,
                  fontWeight: 500,
                }}
              />
              <Tooltip
                wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
              />

              {/* ── PASSED — bottom layer ── */}
              <Bar
                dataKey="passed"
                stackId="trend"
                maxBarSize={999}
                shape={(shapeProps) => (
                  <PassedShape
                    {...shapeProps}
                    activeIndex={activeIndex}
                  />
                )}
              >
                {trendData.map((_, index) => (
                  <Cell key={`trend-pass-${index}`} />
                ))}
              </Bar>

              {/* ── REJECTED — top layer ── */}
              <Bar
                dataKey="rejected"
                stackId="trend"
                maxBarSize={999}
                shape={(shapeProps) => (
                  <RejectedShape
                    {...shapeProps}
                    activeIndex={activeIndex}
                  />
                )}
              >
                {trendData.map((_, index) => (
                  <Cell key={`trend-rej-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  );
};

export default MonthlyTrendChart;

