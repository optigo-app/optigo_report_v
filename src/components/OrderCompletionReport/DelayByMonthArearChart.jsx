  import { Chip, Paper, Typography, Box, IconButton } from "@mui/material";
  import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
  import React, { useMemo, useState } from "react";
  import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
  } from "recharts";
  import { ChevronLeft, ChevronRight } from "@mui/icons-material";

  const DelayByMonthArearChart = ({ delaybyday }) => {
  const groupedByMonth = useMemo(() => {
    if (!delaybyday || delaybyday?.length === 0) {
      const today = new Date();
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(today),
        end: endOfMonth(today),
      });
  
      return [
        {
          month: format(today, "yyyy-MM"),
          values: daysInMonth?.map((d, idx) => ({
            day: idx + 1,
            delayPercent: 0,
          })) || [],
        },
      ];
    }
  
    // group items by month
    const groups = {};
    delaybyday.forEach((item) => {
      const date = parseISO(item?.date);
      const key = format(date, "yyyy-MM");
      if (!groups[key]) groups[key] = {};
      const day = parseInt(format(date, "d"), 10);
  
      groups[key][day] = {
        day,
        delayPercent: Number(item?.delayPercent?.toFixed(2)) || 0,
      };
    });
  
    // normalize each group into a full month
    return Object.entries(groups)?.map(([month, dayMap]) => {
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(parseISO(month + "-01")),
        end: endOfMonth(parseISO(month + "-01")),
      });
  
      return {
        month,
        values: daysInMonth?.map((d, idx) => {
          const day = idx + 1;
          return dayMap[day] || { day, delayPercent: 0 };
        }) || [],
      };
    });
  }, [delaybyday]);
  

    const [monthIndex, setMonthIndex] = useState(0);

    if (!groupedByMonth.length) return null;

    const currentMonth = groupedByMonth[monthIndex];
    const chartTitle = `Delay by Days - ${format(parseISO(currentMonth?.month + "-01"), "MMMM yyyy")}`;

    const handlePrev = () => {
      if (monthIndex > 0) setMonthIndex(monthIndex - 1);
    };
    const handleNext = () => {
      if (monthIndex < groupedByMonth.length - 1) setMonthIndex(monthIndex + 1);
    };

    return (
      <>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handlePrev} disabled={monthIndex === 0} size="small" sx={{bgcolor:'#7171711a'}} >
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6">{chartTitle}</Typography>
            <IconButton
              onClick={handleNext}
              disabled={monthIndex === groupedByMonth.length - 1}
              size="small"
              sx={{bgcolor:'#7171711a'}}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {monthIndex + 1} / {groupedByMonth.length}
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={380}>
          <AreaChart
            data={currentMonth.values}
            height={350}
            margin={{ top: 30, right: 20, left: 20, bottom: 3 }}
          >
            <defs>
              <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              interval={0}
              axisLine={false}
              tickLine={false}
              height={40}
              tick={({ x, y, payload }) => {
                const day = payload.value;
                return (
                  <foreignObject x={x - 12} y={y + 8} width={30} height={30}>
                    <Chip
                      label={`${day}`}
                      size="small"
                      sx={{
                        fontSize: 10,
                        height: 24,
                        borderRadius: "16px",
                        px: 1,
                        bgcolor: "#ef4444",
                        color: "#fff",
                        ".MuiChip-label": { padding: 0 },
                      }}
                    />
                  </foreignObject>
                );
              }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} formatter={(value) => [`${value}%`, "Delay %"]} />
            <Area
              type="monotone"
              dataKey="delayPercent"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorDelay)"
            >
              <LabelList
                dataKey="delayPercent"
                position="top"
                dy={-4}
                style={{ fontSize: 12, fill: "#111", fontWeight: 500 }}
                formatter={(val) => `${val}%`}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </>
    );
  };

  export default DelayByMonthArearChart;

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
        Day {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {value}%
      </Typography>
    </Paper>
  );
};



// import { Chip, Paper, Typography } from "@mui/material";
// import { format, parseISO } from "date-fns";
// import React from "react";
// import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";

// const DelayByMonthArearChart = ({ delaybyday }) => {
//   if (!delaybyday || delaybyday.length === 0) return null;
//   const firstDate = parseISO(delaybyday[0].date);
//   const chartTitle = `Delay by Days - ${format(firstDate, "MMMM yyyy")}`;
//   const FormattedDate = delaybyday?.map((val, i) => ({
//     day: i + 1,
//     delayPercent: Number(val?.delayPercent?.toFixed(2)),
//   }))
  
//   return (
//     <>
//       <Typography variant="h6" mb={3}>
//         {chartTitle}
//       </Typography>
//       <ResponsiveContainer width="100%" height={380}>
//         <AreaChart
//           data={FormattedDate}
//           height={350}
//           margin={{ top: 30, right: 20, left: 20, bottom: 3 }} // extra bottom space for chips
//         >
//           <defs>
//             <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
//               <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey="day"
//             interval={0} // show all days
//             axisLine={false}
//             tickLine={false}
//             height={40} // reserve height for custom tick
//             tick={({ x, y, payload }) => {
//               const day = payload.value;
//               return (
//                 <foreignObject x={x - 12} y={y + 8} width={30} height={30}>
//                   <Chip
//                     label={`${day}`}
//                     size="small"
//                     color="primary"
//                     sx={{
//                       fontSize: 10,
//                       height: 24,
//                       borderRadius: "16px",
//                       px: 1,
//                       bgcolor: "#ef4444",
//                       color: "#fff",
//                       ".MuiChip-label": { padding: 0 },
//                     }}
//                   />
//                 </foreignObject>
//               );
//             }}
//           />
//           <YAxis hide />
//           <Tooltip content={<CustomTooltip />} formatter={(value) => [`${value}%`, "Delay %"]} />
//           <Area type="monotone" dataKey="delayPercent" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDelay)">
//             <LabelList
//               dataKey="delayPercent"
//               position="top"
//               dy={-4}
//               style={{
//                 fontSize: 12,
//                 fill: "#111",
//                 fontWeight: 500,
//                 bgcolor: "#ef4444",
//               }}
//               formatter={(val) => `${val}%`}
//             />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </>
//   );
// };

// export default DelayByMonthArearChart;

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
//         Day {label}
//       </Typography>
//       <Typography variant="subtitle2" fontWeight={600}>
//         {value}%
//       </Typography>
//     </Paper>
//   );
// };
