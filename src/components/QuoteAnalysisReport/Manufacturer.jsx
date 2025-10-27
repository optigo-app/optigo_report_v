import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const { name, salesCount, orderCount, saleAmount, items } = payload[0].payload;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Light mode
        color: "text.primary",
        borderRadius: 2,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid",
        borderColor: "divider",
        minWidth: 200,
        transition: "all 0.2s ease-in-out",
        ...(theme) =>
          theme.palette.mode === "dark" && {
            backgroundColor: "rgba(30, 30, 30, 0.6)", // Dark mode
          },
      }}
    >
      <Typography variant="subtitle2" sx={{ fontSize: "rem" }} fontWeight={600} gutterBottom>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.73rem" }}>
        Sales Count: <b>{salesCount}</b>
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.73rem" }}>
        Order Count: <b>{orderCount}</b>
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.73rem" }}>
        Sale Amount: <b>₹{saleAmount.toLocaleString()}</b>
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.73rem" }}>
        Item Count: <b>{items?.length || 0}</b>
      </Typography>
    </Box>
  );
};

const Manufacturer = ({ TopManufacturerData }) => {
  const theme = useTheme();
  return (
    <Box sx={{ borderRadius: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 300, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#0f172a", mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Top Manufacturer Performance
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor:   theme.palette.primary.main }} />
          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 500 }}>
            Sales
          </Typography>
      </Box>
            
          </Typography>
        </Box>
        <Box sx={{ flex: 2, minWidth: 300, mt: -3 }}>
          <Box sx={{ position: "relative", height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={TopManufacturerData} margin={{}}>
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke={alpha(theme.palette.primary.main, 0.2)} strokeWidth={2} />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: theme.palette.text.primary,
                    fontWeight: 500,
                    dy: 1,
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, "dataMax"]}
                  tick={{
                    fontSize: 10,
                    fill: theme.palette.text.secondary,
                  }}
                />
                <Radar name="Sales Performance" dataKey="salesCount" stroke={theme.palette.primary.main} fill="url(#radarGradient)" strokeWidth={3} dot={{ r: 6, fill: theme.palette.primary.main }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Manufacturer;
