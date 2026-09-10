import React from "react";
import { Box, Typography, styled } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ArrowRight } from "lucide-react";

const ChartCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
}));

const QCDispositionChart = ({
  dispositionData = [],
  totalCount = 0,
  passRate = 0,
  rejectionRatio = 0,
  topDefect = "None",
}) => {
  const passedItem = dispositionData.find((d) => d.name === "Passed") || {
    value: 0,
    percentage: 0,
  };
  const rejectedItem = dispositionData.find((d) => d.name === "Rejected") || {
    value: 0,
    percentage: 0,
  };

  const chartData = [
    {
      name: "Passed",
      value: passedItem.value || 0,
      percentage: passedItem.percentage || 0,
      color: "#10b981",
    },
    {
      name: "Rejected",
      value: rejectedItem.value || 0,
      percentage: rejectedItem.percentage || 0,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  const finalChartData =
    chartData.length > 0
      ? chartData
      : [{ name: "Passed", value: 1, color: "#10b981" }];

  return (
    <ChartCard elevation={0}>
      <Box
        display="flex"
        alignItems="stretch"
        justifyContent="space-between"
        flex={1}
        minHeight={0}
        gap={1.5}
      >
        {/* Left Column matching reference image layout */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          sx={{ width: "48%", minWidth: 0, py: 0.5 }}
        >
          {/* 1. Header */}
          <Box>
            <Typography
              variant="h6"
              fontWeight={900}
              color="#0f172a"
              sx={{
                fontSize: "1.25rem",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              QC Disposition
            </Typography>
            <Typography
              variant="caption"
              color="#64748b"
              sx={{
                fontSize: "0.76rem",
                display: "block",
                mt: 0.3,
                fontWeight: 500,
              }}
            >
              Inspection results overview
            </Typography>
          </Box>

          {/* 2. Big Total Stat & Label */}
          <Box my="auto">
            <Typography
              variant="h4"
              fontWeight={900}
              color="#23262eff"
              sx={{
                fontSize: "2.8rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {totalCount.toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              color="#64748b"
              sx={{ fontSize: "0.82rem", mt: 0.3, fontWeight: 500 }}
            >
              Total inspected
            </Typography>

            {/* 3. Bullet Metrics (Clean Dot List, No Rework) */}
            <Box display="flex" flexDirection="column" gap={0.8} mt={1.8}>
              {/* Passed */}
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    bgcolor: "#10b981",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.84rem", color: "#334155" }}
                >
                  Passed:{" "}
                  <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                    {passedItem.percentage}%
                  </strong>
                </Typography>
              </Box>

              {/* Rejected */}
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    bgcolor: "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.84rem", color: "#334155" }}
                >
                  Rejected:{" "}
                  <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                    {rejectedItem.percentage}%
                  </strong>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 4. Bottom Link matching 'View Details ->' */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap={0.6}
            sx={{
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 0.15s ease",
              "&:hover": {
                transform: "translateX(2px)",
              },
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              color="#0f172a"
              sx={{ fontSize: "0.84rem" }}
            >
              View Details
            </Typography>
            <ArrowRight size={14} color="#0f172a" />
          </Box>
        </Box>

        {/* Right Donut Gauge */}
        <Box
          sx={{
            width: "52%",
            height: "100%",
            position: "relative",
            minHeight: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Center Pass Rate Indicator (rendered with zIndex 1 behind tooltip) */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              color="#0f172a"
              sx={{ fontSize: "1.25rem", lineHeight: 1 }}
            >
              {passRate}%
            </Typography>
            <Typography
              variant="caption"
              color="#64748b"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 600,
                display: "block",
                mt: 0.3,
              }}
            >
              Pass Rate
            </Typography>
          </Box>

          <ResponsiveContainer width="100%" height="100%" style={{ position: "relative", zIndex: 2 }}>
            <PieChart>
              <Pie
                data={finalChartData}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="90%"
                paddingAngle={finalChartData.length > 1 ? 4 : 0}
                cornerRadius={8}
                dataKey="value"
              >
                {finalChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 99999, pointerEvents: "none" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <Box
                      sx={{
                        bgcolor: "#1e293b",
                        color: "#fff",
                        px: 1.2,
                        py: 0.6,
                        borderRadius: 1.5,
                        fontSize: "0.75rem",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                        zIndex: 99999,
                        position: "relative",
                        pointerEvents: "none",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: "#fff", display: "block" }}
                      >
                        {d.name}: {d.value} pcs ({d.percentage}%)
                      </Typography>
                    </Box>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </ChartCard>
  );
};

export default QCDispositionChart;
