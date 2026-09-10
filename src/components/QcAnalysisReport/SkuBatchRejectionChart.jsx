import React, { useState } from "react";
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

// Semantic colors clearly denoting Accepted vs Rejected
const QC_COLORS = {
  passed: {
    fill: "rgba(16, 185, 129, 0.22)",
    hover: "rgba(16, 185, 129, 0.38)",
    solid: "#10b981",
    text: "#059669",
    pillBg: "#ecfdf5",
  },
  rejected: {
    fill: "rgba(239, 68, 68, 0.85)",
    hover: "#dc2626",
    solid: "#ef4444",
    text: "#dc2626",
    pillBg: "#fef2f2",
  },
};

/* ─── Floating Dark Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, sortedData }) => {
  if (!active || !payload || !payload.length) return null;

  const item =
    sortedData?.find((c) => c.sku === payload[0]?.payload?.sku) ||
    payload[0]?.payload ||
    {};

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
            bgcolor: item.rejectionRate > 0 ? QC_COLORS.rejected.solid : QC_COLORS.passed.solid,
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
          {item.rejectionRate || 0}% Rejection
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "#94a3b8", fontSize: "0.72rem", display: "block" }}
      >
        Batch: {item.sku} • {item.total || 0} pcs
      </Typography>
      {item.customer && item.customer !== "—" && (
        <Typography
          variant="caption"
          sx={{ color: "#cbd5e1", fontSize: "0.7rem", display: "block", mt: 0.2 }}
        >
          Customer: {item.customer}
        </Typography>
      )}
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
          sx={{ color: "#4ade80", fontSize: "0.7rem", fontWeight: 600 }}
        >
          {item.passed || 0} Passed ({item.passRate || 0}%)
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#f87171", fontSize: "0.7rem", fontWeight: 600 }}
        >
          {item.rejected || 0} Rejected
        </Typography>
      </Box>
    </Box>
  );
};

/* ─── PASSED bar shape (bottom layer — Green) ────────────────── */
const PassedShape = (props) => {
  const { x, y, width, height, isHovered } = props;
  if (!height || height <= 0 || !width) return null;
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
  const { x, y, width, height, passRate, isHovered } = props;
  if (!width) return null;
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

      {/* Pass % label above the combined bar (hidden on hover to avoid tooltip collision) */}
      {!isHovered && (
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={11.5}
          fontWeight={800}
        >
          {passRate}%
        </text>
      )}
    </g>
  );
};

const SkuBatchRejectionChart = ({ skuData }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const topSkuData = (skuData || []).slice(0, 6).map((item, idx) => ({
    ...item,
    paletteIdx: idx,
  }));

  return (
    <ChartCard elevation={0}>
      {/* ── Header with Title & Legend ── */}
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
            Rejection rate by production batch
          </Typography>
          <Typography
            variant="caption"
            color="#64748b"
            sx={{ fontSize: "0.76rem", display: "block", mt: 0.3, fontWeight: 500 }}
          >
            Accepted and rejected pieces per batch.
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
      </Box>

      {/* ── Chart ── */}
      <Box flex={1} minHeight={0} width="100%">
        {topSkuData.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="caption" color="text.secondary">
              No production batch data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topSkuData}
              barCategoryGap="3%"
              barGap={0}
              margin={{ top: 22, right: 10, left: 5, bottom: 4 }}
              onMouseMove={(state) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <XAxis
                dataKey="sku"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={40}
                tick={({ x, y, payload, index }) => {
                  const item = topSkuData[index] || {};
                  const isRejected = (item.rejectionRate || 0) > 0;
                  const pillBg = isRejected
                    ? QC_COLORS.rejected.pillBg
                    : QC_COLORS.passed.pillBg;
                  const pillText = isRejected
                    ? QC_COLORS.rejected.text
                    : QC_COLORS.passed.text;
                  const label = payload?.value || "";
                  const displayLabel =
                    label.length > 9 ? label.slice(0, 8) + "…" : label;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      {/* Rejection pill */}
                      <rect
                        x={-20}
                        y={2}
                        width={40}
                        height={17}
                        rx={6}
                        fill={pillBg}
                      />
                      <text
                        x={0}
                        y={14}
                        textAnchor="middle"
                        fill={pillText}
                        fontSize={10.5}
                        fontWeight={700}
                      >
                        ↓{item.rejectionRate || 0}%
                      </text>
                      {/* Batch / SKU name */}
                      <text
                        x={0}
                        y={32}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize={10.5}
                        fontWeight={600}
                      >
                        <title>{label}</title>
                        {displayLabel}
                      </text>
                    </g>
                  );
                }}
              />

              <Tooltip
                wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                content={<CustomTooltip sortedData={topSkuData} />}
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
              />

              {/* ── PASSED — bottom layer (Green) ── */}
              <Bar
                dataKey="passed"
                stackId="batch"
                maxBarSize={999}
                shape={(shapeProps) => (
                  <PassedShape
                    {...shapeProps}
                    isHovered={shapeProps.index === activeIndex}
                  />
                )}
              >
                {topSkuData.map((_, i) => (
                  <Cell key={`batch-pass-${i}`} />
                ))}
              </Bar>

              {/* ── REJECTED — top layer (Red) ── */}
              <Bar
                dataKey="rejected"
                stackId="batch"
                maxBarSize={999}
                shape={(shapeProps) => {
                  const item = topSkuData[shapeProps.index] || {};
                  return (
                    <RejectedShape
                      {...shapeProps}
                      passRate={item.passRate || 0}
                      isHovered={shapeProps.index === activeIndex}
                    />
                  );
                }}
              >
                {topSkuData.map((_, i) => (
                  <Cell key={`batch-rej-${i}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  );
};

export default SkuBatchRejectionChart;

