import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const TooltipContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.25, 1.5),
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)", // smooth subtle shadow
  borderRadius: 12,
  minWidth: 120,
  border: "1px solid #E5E7EB", // light border like Tailwind Gray-200
}));

const CustomTooltip = ({ active, payload, label, tooltipColor = "#1D4ED8", ShowPer = true }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  const validColor = /^#[0-9A-F]{6}$/i.test(tooltipColor) ? tooltipColor : "#1D4ED8";

  const labelText = label || data?.name || "Unknown Label";
  const valueText = data?.value != null ? data.value : "N/A"; 

  return (
    <TooltipContainer>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography
          variant="body2"
          sx={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }} // Tailwind Gray-500
        >
          {labelText}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: validColor,
          }}
        >
          {valueText}
          {ShowPer && "%"}
        </Typography>
      </Box>
    </TooltipContainer>
  );
};

export default CustomTooltip;
