import React from "react";
import { Box, Typography, Paper, styled } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
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

// Distinct, richer color palettes per defect type matching CategoryQCChart design language
const DEFECT_PALETTES = [
  {
    accent: "#ef4444",
    passFill: "rgba(239, 68, 68, 0.28)",
    rejFill: "rgba(239, 68, 68, 0.88)",
    pill: "rgba(239, 68, 68, 0.14)",
    pillText: "#dc2626",
  },
  {
    accent: "#6366f1",
    passFill: "rgba(99, 102, 241, 0.28)",
    rejFill: "rgba(99, 102, 241, 0.88)",
    pill: "rgba(99, 102, 241, 0.14)",
    pillText: "#4338ca",
  },
  {
    accent: "#10b981",
    passFill: "rgba(16, 185, 129, 0.28)",
    rejFill: "rgba(16, 185, 129, 0.88)",
    pill: "rgba(16, 185, 129, 0.14)",
    pillText: "#047857",
  },
  {
    accent: "#f59e0b",
    passFill: "rgba(245, 158, 11, 0.30)",
    rejFill: "rgba(245, 158, 11, 0.90)",
    pill: "rgba(245, 158, 11, 0.16)",
    pillText: "#b45309",
  },
  {
    accent: "#0ea5e9",
    passFill: "rgba(14, 165, 233, 0.28)",
    rejFill: "rgba(14, 165, 233, 0.88)",
    pill: "rgba(14, 165, 233, 0.14)",
    pillText: "#0369a1",
  },
  {
    accent: "#8b5cf6",
    passFill: "rgba(139, 92, 246, 0.28)",
    rejFill: "rgba(139, 92, 246, 0.88)",
    pill: "rgba(139, 92, 246, 0.14)",
    pillText: "#6d28d9",
  },
];

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, sortedData }) => {
  if (!active || !payload || !payload.length) return null;
  const item =
    sortedData?.find((c) => c.reason === payload[0]?.payload?.reason) ||
    payload[0]?.payload ||
    {};
  const pal =
    DEFECT_PALETTES[(item.paletteIdx || 0) % DEFECT_PALETTES.length];

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
        minWidth: 165,
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        color="#0f172a"
        mb={0.5}
        sx={{ fontSize: "0.82rem" }}
      >
        {item.reason} — {item.total} pcs
      </Typography>

      {/* Passed row */}
      <Box display="flex" justifyContent="space-between" gap={2} mb={0.25}>
        <Box display="flex" alignItems="center" gap={0.7}>
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: pal.passFill,
              border: `1px solid ${pal.accent}`,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Passed
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color="#0f172a">
          {item.passed || 0} pcs ({item.passRate || 0}%)
        </Typography>
      </Box>

      {/* Rejected row */}
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={0.7}>
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: pal.rejFill,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Rejected
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color={pal.pillText}>
          {item.rejected || 0} pcs ({item.rejectionRate || 0}%)
        </Typography>
      </Box>
    </Box>
  );
};

/* ─── Horizontal PASSED bar shape ─────────────────────────────── */
const PassedShape = (props) => {
  const { x, y, width, height, paletteIdx, hasRejected } = props;
  if (!width || width <= 0 || !height) return null;
  const pal = DEFECT_PALETTES[(paletteIdx || 0) % DEFECT_PALETTES.length];
  const r = height / 2;

  // If there is NO rejected portion (100% passed), round BOTH left and right ends as a full pill!
  if (!hasRejected) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={pal.passFill}
        rx={r}
        ry={r}
      />
    );
  }

  // If followed by a rejected segment, round only the outer left side
  return (
    <path
      d={`
        M ${x + r},${y}
        L ${x + width},${y}
        L ${x + width},${y + height}
        L ${x + r},${y + height}
        A ${r},${r} 0 0 1 ${x},${y + r}
        A ${r},${r} 0 0 1 ${x + r},${y}
        Z
      `}
      fill={pal.passFill}
    />
  );
};

/* ─── Horizontal REJECTED bar shape ──────────────────────────── */
const RejectedShape = (props) => {
  const { x, y, width, height, paletteIdx, passRate, hasPassed } = props;
  if (!height) return null;
  const pal = DEFECT_PALETTES[(paletteIdx || 0) % DEFECT_PALETTES.length];
  const hasRejected = width && width > 0;
  const r = height / 2;

  return (
    <g>
      {hasRejected && (
        hasPassed ? (
          // If preceded by a passed segment, round only outer right side
          <path
            d={`
              M ${x},${y}
              L ${x + width - r},${y}
              A ${r},${r} 0 0 1 ${x + width},${y + r}
              A ${r},${r} 0 0 1 ${x + width - r},${y + height}
              L ${x},${y + height}
              Z
            `}
            fill={pal.rejFill}
          />
        ) : (
          // If 0% passed (100% rejected), round both ends as a full pill
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={pal.rejFill}
            rx={r}
            ry={r}
          />
        )
      )}

      {/* Pass % label at the right end of the combined bar */}
      <text
        x={x + (hasRejected ? width : 0) + 9}
        y={y + height / 2}
        dominantBaseline="central"
        fill="#0f172a"
        fontSize={11.5}
        fontWeight={700}
      >
        {passRate}%
      </text>
    </g>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const DefectsByTypeChart = ({ defectData }) => {
  const sortedData = [...(defectData || [])].slice(0, 5);

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
            variant="subtitle1"
            fontWeight={900}
            color="#0f172a"
            sx={{  fontSize: "1.25rem", }}
          >
            Defects by type
          </Typography>
          <Typography variant="caption" color="#64748b">
            Accepted and rejected pieces per defect type.
          </Typography>
        </Box>

        {/* Legend */}
        <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
          <Box display="flex" alignItems="center" gap={0.8}>
            <Box
              sx={{
                width:15,
                height:15,
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
                width:15,
                height:15,
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

      {/* ── Horizontal Bar Chart ── */}
      <Box flex={1} minHeight={0} width="100%">
        {chartData.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="caption" color="text.secondary">
              No defect data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barCategoryGap="10%"
              margin={{ top: 6, right: 44, left: 6, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="reason"
                type="category"
                axisLine={false}
                tickLine={false}
                width={142}
                tick={({ x, y, payload, index }) => {
                  const item = chartData[index] || {};
                  const paletteIdx =
                    item.paletteIdx !== undefined ? item.paletteIdx : index;
                  const pal =
                    DEFECT_PALETTES[paletteIdx % DEFECT_PALETTES.length];
                  const rawLabel = payload.value || "";
                  const label =
                    rawLabel.length > 14
                      ? rawLabel.slice(0, 13) + "…"
                      : rawLabel;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      {/* Defect reason name */}
                      <text
                        x={-138}
                        y={0}
                        dominantBaseline="central"
                        textAnchor="start"
                        fill="#334155"
                        fontSize={10.5}
                        fontWeight={600}
                      >
                        <title>{rawLabel}</title>
                        {label}
                      </text>
                      {/* Rejection pill */}
                      <rect
                        x={-42}
                        y={-9}
                        width={36}
                        height={18}
                        rx={6}
                        fill={pal.pill}
                      />
                      <text
                        x={-24}
                        y={0}
                        dominantBaseline="central"
                        textAnchor="middle"
                        fill={pal.pillText}
                        fontSize={9.5}
                        fontWeight={700}
                      >
                        ↓{item.rejectionRate || 0}%
                      </text>
                    </g>
                  );
                }}
              />

              <Tooltip
                wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                content={<CustomTooltip sortedData={sortedData} />}
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
              />

              {/* ── PASSED — left segment ── */}
              <Bar
                dataKey="passed"
                stackId="qc"
                barSize={35}
                shape={(shapeProps) => {
                  const item =
                    shapeProps.payload || chartData[shapeProps.index] || {};
                  return (
                    <PassedShape
                      {...shapeProps}
                      paletteIdx={item.paletteIdx ?? shapeProps.index}
                      hasRejected={(item.rejected || 0) > 0}
                    />
                  );
                }}
              >
                {chartData.map((_, i) => (
                  <Cell key={`pass-${i}`} />
                ))}
              </Bar>

              {/* ── REJECTED — right segment ── */}
              <Bar
                dataKey="rejected"
                stackId="qc"
                barSize={35}
                shape={(shapeProps) => {
                  const item =
                    shapeProps.payload || chartData[shapeProps.index] || {};
                  return (
                    <RejectedShape
                      {...shapeProps}
                      paletteIdx={item.paletteIdx ?? shapeProps.index}
                      passRate={item.passRate || 0}
                      hasPassed={(item.passed || 0) > 0}
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
        )}
      </Box>
    </ChartCard>
  );
};

export default DefectsByTypeChart;
