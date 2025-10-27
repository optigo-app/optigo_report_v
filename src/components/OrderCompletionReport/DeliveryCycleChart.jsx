import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { alpha, Box, Paper, Typography, useTheme } from "@mui/material";

const deliveryCycleData = [
  { name: "Type 17", gradient: { from: "#fde047", to: "#facc15" } },
  { name: "Type 2", gradient: { from: "#93c5fd", to: "#60a5fa" } },
  { name: "Type 18", gradient: { from: "#f8c1b2", to: "#f4b4a2" } },
  { name: "Type 3", gradient: { from: "#fb923c", to: "#f59e0b" } },
  { name: "Type 19", gradient: { from: "#a1bffb", to: "#8eaaf9" } },
  { name: "Type 4", gradient: { from: "#fcd34d", to: "#fbbf24" } },
  { name: "Type 5", gradient: { from: "#3b82f6", to: "#6366f1" } },
  { name: "Type 6", gradient: { from: "#60a5fa", to: "#3b82f6" } },
  { name: "Type 7", gradient: { from: "#67e8f9", to: "#22d3ee" } },
  { name: "Type 8", gradient: { from: "#a78bfa", to: "#8b5cf6" } },
  { name: "Type 9", gradient: { from: "#fb7185", to: "#f43f5e" } },
  { name: "Type 10", gradient: { from: "#fbbf24", to: "#f59e0b" } },
  { name: "Type 11", gradient: { from: "#34d399", to: "#10b981" } },
  { name: "Type 12", gradient: { from: "#ec4899", to: "#db2777" } },
  { name: "Type 13", gradient: { from: "#c4b5fd", to: "#a78bfa" } },
  { name: "Type 14", gradient: { from: "#f87171", to: "#ef4444" } },
  { name: "Type 15", gradient: { from: "#4ade80", to: "#22c55e" } },
  { name: "Type 1", gradient: { from: "#0ea5e9", to: "#38bdf8" } },
  { name: "Type 16", gradient: { from: "#c084fc", to: "#a855f7" } },
  { name: "Type 20", gradient: { from: "#d8b4fe", to: "#c084fc" } },
];

export default function DeliveryCyclePieChart({ averageDeliveryDayByCompanyType }) {
  const theme = useTheme();

  const formatted = averageDeliveryDayByCompanyType?.map((item, i) => {
    const colorSource = deliveryCycleData[i % deliveryCycleData.length];
    return {
      name: item?.companyType,
      value: item?.averageDelayDays,
      gradientId: `grad-${i}`,
      gradient: colorSource.gradient,
    };
  });

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Average Delivery Day (Company Type)
      </Typography>

      <Box
        display="flex"
        gap={4}
        justifyContent="space-between"
        flexDirection={{
          xs: "column",    // mobile: stack
          sm: "row",       // small screens & up: row
        }}
      >
        {/* Left: Pie chart */}
        <Box flex="1 1 250px" minWidth={250} height={370}>
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {formatted?.map((entry, index) => (
                  <linearGradient
                    key={`grad-${index}`}
                    id={`grad-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={entry.gradient.from} />
                    <stop offset="100%" stopColor={entry.gradient.to} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={formatted}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={3}
                cornerRadius={6}
              >
                {formatted?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Right: Custom legend */}
        <Box flex="1 1 150px" minWidth={150} height={365} overflow="auto" display="flex" flexDirection="column" gap={1}
            mt={{ xs: 2, sm: 0 }} // add spacing when stacked
        >
          {formatted?.map((entry, i) => (
            <Box
              key={i}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1}
              borderRadius={theme.shape.borderRadius}
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: `linear-gradient(45deg, ${entry.gradient.from}, ${entry.gradient.to})`,
                  }}
                />
                <Typography variant="body2" fontSize={13} fontWeight={500}>
                  {entry?.name}
                </Typography>
              </Box>
              <Typography variant="body2" fontSize={12} color="text.secondary">
                {entry?.value} days
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;

  return (
    <Paper
      elevation={3}
      sx={{
        px: 2,
        py: 1,
        borderRadius: 2,
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(255,255,255,0.9)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        Day
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {value}
      </Typography>
    </Paper>
  );
};

// import React from "react";
// import { RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
// import { alpha, Paper, Typography } from "@mui/material";

// const deliveryCycleData = [
//   { name: "Type 17", fill: "#fef08a", gradient: { from: "#fde047", to: "#facc15" } },
//   { name: "Type 2", fill: "#bae6fd", gradient: { from: "#93c5fd", to: "#60a5fa" } },
//   { name: "Type 18", fill: "#fcd5ce", gradient: { from: "#f8c1b2", to: "#f4b4a2" } },
//   { name: "Type 3", fill: "#fdba74", gradient: { from: "#fb923c", to: "#f59e0b" } },
//   { name: "Type 19", fill: "#c1d3fe", gradient: { from: "#a1bffb", to: "#8eaaf9" } },
//   { name: "Type 4", fill: "#fed7aa", gradient: { from: "#fcd34d", to: "#fbbf24" } },
//   { name: "Type 5", fill: "#38bdf8", gradient: { from: "#3b82f6", to: "#6366f1" } },
//   { name: "Type 6", fill: "#7dd3fc", gradient: { from: "#60a5fa", to: "#3b82f6" } },
//   { name: "Type 7", fill: "#a5f3fc", gradient: { from: "#67e8f9", to: "#22d3ee" } },
//   { name: "Type 8", fill: "#c4b5fd", gradient: { from: "#a78bfa", to: "#8b5cf6" } },
//   { name: "Type 9", fill: "#fda4af", gradient: { from: "#fb7185", to: "#f43f5e" } },
//   { name: "Type 10", fill: "#fcd34d", gradient: { from: "#fbbf24", to: "#f59e0b" } },
//   { name: "Type 11", fill: "#6ee7b7", gradient: { from: "#34d399", to: "#10b981" } },
//   { name: "Type 12", fill: "#f9a8d4", gradient: { from: "#ec4899", to: "#db2777" } },
//   { name: "Type 13", fill: "#ddd6fe", gradient: { from: "#c4b5fd", to: "#a78bfa" } },
//   { name: "Type 14", fill: "#fca5a5", gradient: { from: "#f87171", to: "#ef4444" } },
//   { name: "Type 15", fill: "#86efac", gradient: { from: "#4ade80", to: "#22c55e" } },
//   { name: "Type 1", fill: "#0ea5e9", gradient: { from: "#0ea5e9", to: "#38bdf8" } },
//   { name: "Type 16", fill: "#d8b4fe", gradient: { from: "#c084fc", to: "#a855f7" } },
//   { name: "Type 20", fill: "#e9d5ff", gradient: { from: "#d8b4fe", to: "#c084fc" } },
// ];

// export default function DeliveryCycleRadialChart({ averageDeliveryDayByCompanyType }) {
//   const formatted = averageDeliveryDayByCompanyType?.map((item, i) => {
//     const colorSource = deliveryCycleData[i % deliveryCycleData.length];
//     return {
//       name: item?.companyType,
//       days: item?.averageDelayDays,
//       gradientId: `gradient-${i}`,
//       fill: colorSource.fill,
//       gradient: colorSource.gradient,
//     };
//   });

//   return (
//     <>
//       <Typography variant="h6" gutterBottom>
//         Average Delivery Day (Company Type)
//       </Typography>

//       <ResponsiveContainer width="100%" height={380}>
//         <RadialBarChart
//           cx="50%"
//           cy="50%"
//           innerRadius={20}
//           outerRadius="95%"
//           barSize={25}
//           startAngle={0}
//           endAngle={360}
//           data={formatted}
//           margin={{
//             top: 20,
//             bottom: 20,
//           }}
//         >
//           <defs>
//             {formatted?.map((entry, index) => (
//               <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor={entry.gradient.from} />
//                 <stop offset="100%" stopColor={entry.gradient.to} />
//               </linearGradient>
//             ))}
//           </defs>

//           <PolarGrid
//             gridType="circle"
//             stroke={alpha("#000", 0.05)} // subtle grid lines
//             strokeWidth={1}
//             polarRadius={[20, 40, 60, 80]} // only a few rings for less clutter
//             strokeDasharray="3 3" // soft dotted effect
//           />

//           <PolarAngleAxis type="number" hide reversed />
//           <PolarRadiusAxis type="category" hide />

//           <RadialBar
//             dataKey="days"
//             clockWise
//             cornerRadius={12}
//             label={{
//               fill: "#1f2937",
//               fontSize: 12,
//               fontWeight: 600,
//               position: "insideStart",
//             }}
//           >
//             {formatted?.map((entry, index) => (
//               <Cell key={`bar-${index}`} fill={`url(#grad-${index})`} />
//             ))}
//           </RadialBar>

//           <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 13, marginBottom: -30 }} />

//           <Tooltip content={<CustomTooltip />} />
//         </RadialBarChart>
//       </ResponsiveContainer>
//     </>
//   );
// }

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;

//   const value = payload[0]?.value;

//   return (
//     <Paper
//       elevation={3}
//       sx={{
//         px: 2,
//         py: 1,
//         borderRadius: 2,
//         backdropFilter: "blur(6px)",
//         backgroundColor: "rgba(255,255,255,0.9)",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//       }}
//     >
//       <Typography variant="caption" color="text.secondary" fontWeight={500}>
//         Day
//       </Typography>
//       <Typography variant="subtitle2" fontWeight={600}>
//         {value}
//       </Typography>
//     </Paper>
//   );
// };
