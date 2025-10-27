import { styled, Paper, Box, Typography } from "@mui/material";
import React, { memo, useCallback, useState, useEffect } from "react";
import YearPicker from "./YearPicker";
import debounce from "lodash.debounce";

const HeaderCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "none",
  border: "none",
  outline: "none",
}));

const Header = memo(({ CurrentMonth, CurrentYear, setCurrentMonth, setCurrentYear }) => {
  const [tempMonth, setTempMonth] = useState(CurrentMonth);
  const [tempYear, setTempYear] = useState(CurrentYear);

  // Debounced updater for parent
  const debouncedUpdate = useCallback(
    debounce((month, year) => {
      setCurrentMonth(month);
      setCurrentYear(year);
    }, 300),
    []
  );

  // Sync props to temp state when parent changes
  useEffect(() => {
    setTempMonth(CurrentMonth);
    setTempYear(CurrentYear);
  }, [CurrentMonth, CurrentYear]);

  const handleChange = (data) => {
    setTempMonth(data.month);
    setTempYear(data.year);
    debouncedUpdate(data.month, data.year);
  };

  const handlePrev = (month, year) => {
    setTempMonth(month);
    setTempYear(year);
    debouncedUpdate(month, year);
  };

  const handleNext = (month, year) => {
    setTempMonth(month);
    setTempYear(year);
    debouncedUpdate(month, year);
  };

  const handleMonthChange = (month) => {
    setTempMonth(month);
    debouncedUpdate(month, tempYear);
  };

  const handleYearChange = (year) => {
    setTempYear(year);
    debouncedUpdate(tempMonth, year);
  };

  return (
    <HeaderCard elevation={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" fontWeight={600}>
            Sales Analysis
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <YearPicker
            month={tempMonth}
            year={tempYear}
            onChange={handleChange}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </Box>
      </Box>
    </HeaderCard>
  );
});

export default Header;
