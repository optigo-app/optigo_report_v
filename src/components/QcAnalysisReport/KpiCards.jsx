import React from "react";
import { Paper, Box, Typography, styled } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";

const StripContainer = styled(Paper)(({ theme }) => ({
  padding: "8px 4px 6px 4px",
  backgroundColor: "#ffffff",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  flexShrink: 0,
  borderRadius: "0px",
  boxSizing: "border-box",
}));

const MetricColumn = styled(Box)(({ theme, hasborder }) => ({
  flex: "1 1 0",
  padding: "2px 20px",
  borderRight: hasborder ? `1px solid ${theme.palette.divider}` : "none",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  boxSizing: "border-box",
}));

const Pill = styled(Box)(({ bgcolor, color, border }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 3.5,
  padding: "2px 7px",
  borderRadius: "9999px",
  fontSize: "0.71rem",
  fontWeight: 600,
  fontFamily: '"Poppins", sans-serif',
  backgroundColor: bgcolor,
  color: color,
  border: border || "none",
  lineHeight: 1.25,
  flexShrink: 0,
}));

// Smooth Catmull-Rom to Cubic Bezier curve generator
const getSvgPath = (points, isArea = false, height = 22) => {
  if (!points || points.length === 0) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 5.5;
    const cp1y = p1.y + (p2.y - p0.y) / 5.5;
    const cp2x = p2.x - (p3.x - p1.x) / 5.5;
    const cp2y = p2.y - (p3.y - p1.y) / 5.5;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  if (isArea) {
    const lastPoint = points[points.length - 1];
    d += ` L ${lastPoint.x},${height} L ${points[0].x},${height} Z`;
  }
  return d;
};

const MiniSparkline = ({ color, gradientId, points }) => {
  const height = 22;
  const linePath = getSvgPath(points, false, height);
  const areaPath = getSvgPath(points, true, height);

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: `${height}px`,
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="65%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const KpiCards = ({ kpiData }) => {
  if (!kpiData) return null;

  const {
    totalInspected = 0,
    uniqueJobs = 0,
    passedCount = 0,
    rejectedCount = 0,
    rejectionRatio = 0,
    passRate = 0,
    topDefect = "None",
    topDefectCount = 0,
  } = kpiData;

  const isRejectionHigh = rejectionRatio > 10;

  const metrics = [
    {
      label: "Total Inspected",
      value: totalInspected.toLocaleString(),
      isText: false,
      subtext: `${uniqueJobs} Unique Lots`,
      pillText: "100%",
      pillBg: "#eff6ff",
      pillColor: "#2563eb",
      pillBorder: "1px solid #dbeafe",
      pillIcon: <CheckCircle2 size={12} strokeWidth={2.2} />,
    },
    {
      label: "Passed Pieces",
      value: passedCount.toLocaleString(),
      isText: false,
      subtext: "Approved in QC",
      pillText: `${passRate}%`,
      pillBg: "#ecfdf5",
      pillColor: "#059669",
      pillBorder: "1px solid #a7f3d0",
      pillIcon: <TrendingUp size={12} strokeWidth={2.2} />,
      sparkline: {
        color: "#10b981",
        gradientId: "sparkline-passed",
        points: [
          { x: 0, y: 16 },
          { x: 12, y: 12 },
          { x: 24, y: 14 },
          { x: 38, y: 9 },
          { x: 50, y: 11 },
          { x: 62, y: 7 },
          { x: 74, y: 8 },
          { x: 86, y: 4 },
          { x: 94, y: 5 },
          { x: 100, y: 2 },
        ],
      },
    },
    {
      label: "Rejected Pieces",
      value: rejectedCount.toLocaleString(),
      isText: false,
      subtext: "Failed inspection",
      pillText: `${rejectionRatio}%`,
      pillBg: rejectedCount > 0 ? "#fef2f2" : "#f8fafc",
      pillColor: rejectedCount > 0 ? "#dc2626" : "#64748b",
      pillBorder: rejectedCount > 0 ? "1px solid #fecaca" : "1px solid #e2e8f0",
      pillIcon: <TrendingDown size={12} strokeWidth={2.2} />,
      sparkline: {
        color: "#ef4444",
        gradientId: "sparkline-rejected",
        points: [
          { x: 0, y: 5 },
          { x: 12, y: 9 },
          { x: 24, y: 11 },
          { x: 38, y: 4 },
          { x: 50, y: 11 },
          { x: 62, y: 12 },
          { x: 74, y: 7 },
          { x: 84, y: 13 },
          { x: 92, y: 12 },
          { x: 100, y: 19 },
        ],
      },
    },
    {
      label: "Rejection Ratio",
      value: `${rejectionRatio}%`,
      isText: false,
      subtext: isRejectionHigh ? "Above target (>10%)" : "Within target (≤10%)",
      pillText: isRejectionHigh ? "High" : "Optimal",
      pillBg: isRejectionHigh ? "#fef2f2" : "#ecfdf5",
      pillColor: isRejectionHigh ? "#dc2626" : "#059669",
      pillBorder: isRejectionHigh ? "1px solid #fecaca" : "1px solid #a7f3d0",
      pillIcon: isRejectionHigh ? (
        <AlertCircle size={12} strokeWidth={2.2} />
      ) : (
        <CheckCircle2 size={12} strokeWidth={2.2} />
      ),
    },
    {
      label: "Primary Defect",
      value: topDefect,
      isText: true,
      subtext: topDefectCount > 0 ? `${topDefectCount} occurrences` : "No defects",
      pillText: topDefectCount > 0 ? `${topDefectCount} pcs` : "None",
      pillBg: "#f5f3ff",
      pillColor: "#7c3aed",
      pillBorder: "1px solid #ddd6fe",
      pillIcon: <Award size={12} strokeWidth={2.2} />,
    },
  ];

  return (
    <StripContainer elevation={0}>
      {metrics.map((item, idx) => (
        <MetricColumn
          key={idx}
          hasborder={idx < metrics.length - 1 ? 1 : 0}
        >
          {/* Top Row: Label & Pill aligned on same baseline */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ minHeight: 22, mb: 0.5 }}
          >
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.92rem",
                fontWeight: 500,
                color: "#475569",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </Typography>
            <Pill
              bgcolor={item.pillBg}
              color={item.pillColor}
              border={item.pillBorder}
            >
              {item.pillIcon}
              <span>{item.pillText}</span>
            </Pill>
          </Box>

          {/* Middle Row: Value with consistent vertical baseline */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 32,
              mb: 0.3,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: item.isText ? 600 : 700,
                color: "#0f172a",
                fontSize: item.isText
                  ? item.value.length > 20
                    ? "1.0rem"
                    : "1.12rem"
                  : "1.62rem",
                lineHeight: 1.18,
                letterSpacing: item.isText ? "-0.01em" : "-0.025em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: item.isText ? "normal" : "nowrap",
                display: "-webkit-box",
                WebkitLineClamp: item.isText ? 2 : 1,
                WebkitBoxOrient: "vertical",
              }}
              title={item.value}
            >
              {item.value}
            </Typography>
          </Box>

          {/* Bottom Row: Subtext aligned consistently */}
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: 500,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.subtext}
          </Typography>

          {/* Sparkline Chart for Passed and Rejected KPI cards */}
          {item.sparkline && (
            <Box
              sx={{
                mt: 0.5,
                width: "100%",
                height: 22,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <MiniSparkline
                color={item.sparkline.color}
                gradientId={item.sparkline.gradientId}
                points={item.sparkline.points}
              />
            </Box>
          )}
        </MetricColumn>
      ))}
    </StripContainer>
  );
};

export default KpiCards;

