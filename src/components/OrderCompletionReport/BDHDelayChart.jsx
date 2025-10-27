import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList, CartesianGrid } from "recharts";
import { Paper, Typography, Box, useTheme, alpha } from "@mui/material";
import { TrendingUp, TrendingDown } from "lucide-react";

const getGradient = (value) => {
  return value <= 50
    ? { from: "#93c5fd", to: "#3b82f6" } // Blue
    : { from: "#fee2e2", to: "#f87171" }; // Red
};

const getIcon = (value) => (value <= 50 ? TrendingDown : TrendingUp);

export default function BDHDelayChart({ saleRepWieseDelay }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const chartId = useMemo(() => `bdh-chart-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    const processData = saleRepWieseDelay?.map((item) => {
      const gradient = getGradient(item?.delayPercent);
      return {
        name: item?.salesRep,
        value: item?.delayPercent,
        gradientId: `${chartId}-gradient-${item?.salesRep?.toLowerCase()}`,
        gradient,
        icon: getIcon(item?.delayPercent),
      };
    });

    setData(processData || []);
  }, [saleRepWieseDelay, chartId]);

  return (
    <>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Sales Rep Wise Delay
        </Typography>
      </Box>

      <Box sx={{ height: 370, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 10 }} barCategoryGap="8%">
            <CartesianGrid
              stroke={alpha(theme.palette.text.primary, 0.1)}
              strokeDasharray="1 1"
              vertical={false}
              horizontal={true}
              enableBackground={true}
              color="black"
            />

            <defs>
              {data.map((item) => (
                <linearGradient key={item.gradientId} id={item.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={item.gradient.from} />
                  <stop offset="100%" stopColor={item.gradient.to} />
                </linearGradient>
              ))}
            </defs>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{
                fontSize: 10,
                fontWeight: 500,
                fill: theme.palette.text.primary,
              }}
              height={50}
              angle={-25}
              textAnchor="end"
            />

            <YAxis domain={[0, 100]} hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: alpha(theme.palette.primary.main, 0.08),
                radius: 4,
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60} minPointSize={4}>
              <LabelList dataKey="value" position="top" fontSize={12} fontWeight={700} formatter={(value) => `${value}%`} fill={theme.palette.text.primary} />

              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} stroke={alpha("#000", 0.1)} strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const { icon: IconComponent, value } = payload[0].payload;

    return (
      <Paper
        elevation={8}
        sx={{
          p: 1.2,
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          minWidth: 90,
          bgcolor: "#fff",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <IconComponent size={16} color="#000" />
          <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h6" color="primary.main" fontWeight={700}>
          {value}%
        </Typography>
      </Paper>
    );
  }
  return null;
};
