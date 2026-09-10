import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import RangeDatePicker from "../shared/RangeDatePicker";
import { RefreshCw } from "lucide-react";

const Header = ({ dateRange, setDateRange, onRefresh }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      mb={1.5}
      flexShrink={0}
    >
      {/* Title & Subtitle matching the screenshot greeting style */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={800}
          color="#0f172a"
          sx={{ letterSpacing: "-0.03em", fontSize: "1.5rem", lineHeight: 1.15 }}
        >
          QC Analysis Overview
        </Typography>
        <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.8rem", mt: 0.2, display: "block" }}>
          Here is your quality control and rejection overview.
        </Typography>
      </Box>

      {/* Date Range Picker & Refresh */}
      <Box display="flex" gap={1.2} alignItems="center">
        <RangeDatePicker value={dateRange} onChange={setDateRange} />
        {onRefresh && (
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={onRefresh}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                p: "7px",
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              <RefreshCw size={16} color="#64748b" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Header;
