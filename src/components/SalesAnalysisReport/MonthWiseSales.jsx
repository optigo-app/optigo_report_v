import React, { useState } from "react";
import { Chip, Paper, Typography } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import ModernSelectChip from "../shared/ModernSelectChip";
import { Box } from "@mui/material";

const MonthWiseSalesArearChart = ({ currentYear, selectedValue, setSelectedValue, YearlySalesData, currentMonth }) => {
  const chartTitle = `Year Wise Sales - ${currentYear}`;
  const formattedMonthlySales = YearlySalesData?.map(({ month, totalAmount }) => ({
    month,
    delayPercent: totalAmount,
  }));

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{chartTitle}</Typography>
        <ModernSelectChip
          value={selectedValue}
          onChange={setSelectedValue}
          options={[
            { label: "All", value: "all" },
            { label: "Labour", value: "labour sale" },
            { label: "Jewellery", value: "Jewellery sale" },
            { label: "Repair", value: "repair sale" },
          ]}
        />
      </Box>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formattedMonthlySales}
        >
          <defs>
            <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5c6d6" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#fcd3e1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#fff0f5" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            interval={0}
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload, index }) => {
              const isFirst = index === 0;
              const isLast = index === formattedMonthlySales.length - 1;
              const shift = isFirst ? 10 : isLast ? -20 : 0;
              const month = payload.value;
              return (
                <foreignObject x={x + shift - 10} y={y + 0} width={100} height={30}>
                  <Chip
                    label={`${month}`}
                    size="small"
                    color="primary"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      borderRadius: "16px",
                      px: 1,
                      color: "#fff",
                      bgcolor: "#e293b5",
                      ".MuiChip-label": {
                        padding: 0,
                      },
                    }}
                  />
                </foreignObject>
              );
            }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} formatter={(value) => [`₹ ${value}`, "Sales"]} />
          <Area
            type="monotone"
            dataKey="delayPercent"
            stroke="#e293b5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorDelay)"
            isAnimationActive={true}
            animationDuration={800}
            onAnimationEnd={() => {
              console.log("Chart animation finished, chart is ready!");
            }}
          >
            <LabelList
              dataKey="delayPercent"
              position="top"
              dy={-14}
              content={({ x, y, value, index }) => {
                if (value == null) return null;
                const isDecember = index === 11;
                const shouldShift = isDecember && (currentMonth === null || currentMonth === 11);
                const shiftX = shouldShift ? 120 : 3;
                return (
                  <foreignObject display={value > 0 ? "flex" : "none"} x={x - shiftX} y={y - 6} width={100} height={20} style={{ zIndex: "10000" }}>
                    <Box
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#22c55e",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        px: "3px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ₹ {value}
                    </Box>
                  </foreignObject>
                );
              }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default MonthWiseSalesArearChart;

const CustomTooltip = ({ active, payload, label }) => {
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
        Month {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        ₹ {value}
      </Typography>
    </Paper>
  );
};

// import React, { useState, useEffect } from "react";
// import { Chip, Paper, Typography, Skeleton, Box, Fade } from "@mui/material";
// import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
// import ModernSelectChip from "../shared/ModernSelectChip";

// const MonthWiseSalesArearChart = ({ selectedValue, setSelectedValue, YearlySalesData }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [showChart, setShowChart] = useState(false);

//   const selectedYear = new Date().getFullYear();
//   const chartTitle = `Year Wise Sales - ${selectedYear}`;

//   const formattedMonthlySales = YearlySalesData?.map(({ month, totalAmount }) => ({
//     month,
//     delayPercent: totalAmount,
//   }));

//   // Simulate loading and smooth transition
//   useEffect(() => {
//     if (YearlySalesData && YearlySalesData.length > 0) {
//       // Small delay to ensure chart is ready to render
//       const timer = setTimeout(() => {
//         setIsLoading(false);
//         // Another small delay for smooth transition
//         setTimeout(() => setShowChart(true), 100);
//       }, 300);

//       return () => clearTimeout(timer);
//     }
//   }, [YearlySalesData]);

//   // Chart Skeleton Loader
//   const ChartSkeleton = () => (
//     <Box sx={{ width: "100%", height: 280, p: 2 }}>
//       {/* Chart area skeleton */}
//       <Skeleton
//         variant="rectangular"
//         width="100%"
//         height={200}
//         sx={{
//           borderRadius: 2,
//           mb: 2,
//           background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
//           backgroundSize: "200% 100%",
//           animation: "shimmer 1.5s infinite",
//           "@keyframes shimmer": {
//             "0%": { backgroundPosition: "200% 0" },
//             "100%": { backgroundPosition: "-200% 0" }
//           }
//         }}
//       />

//       {/* X-axis labels skeleton */}
//       <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
//         {Array.from({ length: 6 }).map((_, index) => (
//           <Skeleton
//             key={index}
//             variant="rounded"
//             width={40}
//             height={20}
//             sx={{ borderRadius: "16px" }}
//           />
//         ))}
//       </Box>
//     </Box>
//   );

//   // Shimmer effect for better loading experience
//   const ShimmerChart = () => (
//     <Box
//       sx={{
//         width: "100%",
//         height: 280,
//         background: "linear-gradient(90deg, rgba(229, 147, 181, 0.1) 0%, rgba(229, 147, 181, 0.3) 50%, rgba(229, 147, 181, 0.1) 100%)",
//         backgroundSize: "200% 100%",
//         animation: "shimmer 2s infinite",
//         borderRadius: 2,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         "@keyframes shimmer": {
//           "0%": { backgroundPosition: "-200% 0" },
//           "100%": { backgroundPosition: "200% 0" }
//         }
//       }}
//     >
//       <Typography variant="body2" color="text.secondary">
//         Loading chart data...
//       </Typography>
//     </Box>
//   );

//   return (
//     <>
//       <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between", mb: 2 }}>
//         <Typography variant="h6">{chartTitle}</Typography>
//         {!isLoading ? (
//           <Fade in={!isLoading} timeout={500}>
//             <div>
//               <ModernSelectChip
//                 value={selectedValue}
//                 onChange={setSelectedValue}
//                 options={[
//                   { label: "All", value: "all" },
//                   { label: "Labour", value: "labour sale" },
//                   { label: "Jewellery", value: "Jewellery sale" },
//                   { label: "Repair", value: "repair sale" },
//                 ]}
//               />
//             </div>
//           </Fade>
//         ) : (
//           <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: "16px" }} />
//         )}
//       </Box>

//       {isLoading ? (
//         <ChartSkeleton />
//       ) : (
//         <Fade in={showChart} timeout={800}>
//           <div>
//             <ResponsiveContainer width="100%" height={280}>
//               <AreaChart data={formattedMonthlySales}>
//                 <defs>
//                   <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#f5c6d6" stopOpacity={0.9} />
//                     <stop offset="50%" stopColor="#fcd3e1" stopOpacity={0.4} />
//                     <stop offset="100%" stopColor="#fff0f5" stopOpacity={0.05} />
//                   </linearGradient>
//                 </defs>

//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   interval={0}
//                   dataKey="month"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={({ x, y, payload, index }) => {
//                     const isFirst = index === 0;
//                     const isLast = index === formattedMonthlySales.length - 1;
//                     const shift = isFirst ? 10 : isLast ? -20 : 0;
//                     const month = payload.value;
//                     return (
//                       <foreignObject x={x + shift - 10} y={y + 0} width={100} height={30}>
//                         <Chip
//                           label={`${month}`}
//                           size="small"
//                           color="primary"
//                           sx={{
//                             fontSize: 10,
//                             height: 20,
//                             borderRadius: "16px",
//                             px: 1,
//                             color: "#fff",
//                             bgcolor: "#e293b5",
//                             ".MuiChip-label": {
//                               padding: 0,
//                             },
//                           }}
//                         />
//                       </foreignObject>
//                     );
//                   }}
//                 />
//                 <YAxis hide />
//                 <Tooltip content={<CustomTooltip />} formatter={(value) => [`₹ ${value}`, "Sales"]} />
//                 <Area
//                   type="monotone"
//                   dataKey="delayPercent"
//                   stroke="#e293b5"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorDelay)"
//                   // Add animation to the area
//                   animationDuration={1200}
//                   animationEasing="ease-out"
//                 >
//                   <LabelList
//                     dataKey="delayPercent"
//                     position="top"
//                     dy={-14}
//                     content={({ x, y, value, index }) => {
//                       if (value == null) return null;
//                       return (
//                         <foreignObject x={x - 18} y={y - 14} width={100} height={20}>
//                           <Box
//                             sx={{
//                               fontSize: 11,
//                               fontWeight: 600,
//                               color: "#22c55e",
//                               backgroundColor: "#fff",
//                               borderRadius: "4px",
//                               px: "3px",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
//                               whiteSpace: "nowrap",
//                               opacity: 0,
//                               animation: "fadeInUp 0.6s ease-out forwards",
//                               animationDelay: `${index * 0.1}s`,
//                               "@keyframes fadeInUp": {
//                                 "0%": {
//                                   opacity: 0,
//                                   transform: "translateY(10px)"
//                                 },
//                                 "100%": {
//                                   opacity: 1,
//                                   transform: "translateY(0)"
//                                 }
//                               }
//                             }}
//                           >
//                             ₹ {value}
//                           </Box>
//                         </foreignObject>
//                       );
//                     }}
//                   />
//                 </Area>
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </Fade>
//       )}
//     </>
//   );
// };

// export default MonthWiseSalesArearChart;

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
//         Month {label}
//       </Typography>
//       <Typography variant="subtitle2" fontWeight={600}>
//         ₹ {value}
//       </Typography>
//     </Paper>
//   );
// };
