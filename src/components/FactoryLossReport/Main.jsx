import { useMemo, useState, useEffect } from "react";
import { Box, Grid, Typography, Paper, IconButton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import CategoryBarChart from "./CategoryBarChart ";
import LossTable from "./LossTable";
import LocationLossChart from "./LocationLossChart";
import ProcessLossChart from "./ProcessLoss";
import RangeDatePicker from "../shared/RangeDatePicker";
import MetTypeSelect from "./MetTypeSelect";
import PureLossAnalyticsCard from "./PureLossAnalyticsCard";
import FactoryLossAnalytics from "../../analytics/FactoryLossAnalytics";
import { useFactoryLoss } from "./../../context/FactoryLossReport";
import { filterFactoryLossData } from "../../libs/FactoryLossFilter";
import { eachMonthOfInterval, startOfMonth, endOfMonth, differenceInMonths, format, isValid } from "date-fns";
import Loader from "../shared/Loader";
import RefreshButton from './RefreshButton';

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  minHeight: 120,
}));

export default function FactoryLossReport() {
  const { rawData } = useFactoryLoss();

  const defaultStart = startOfMonth(new Date());
  const defaultEnd = endOfMonth(new Date());
  const defaultSelectedDate = { startDate: defaultStart, endDate: defaultEnd };
  const [dateRange, setDateRange] = useState(defaultSelectedDate);
  const [selectedTypes, setSelectedTypes] = useState("");
  const [refreshLoading, setRefreshLoading] = useState(false);

  const isDateRangeValid = useMemo(() => {
    return isValid(dateRange.startDate) && isValid(dateRange.endDate);
  }, [dateRange]);

  const isMultiMonth = differenceInMonths(dateRange.endDate, dateRange.startDate) >= 1;

  const monthsList = useMemo(() => {
    if (isDateRangeValid) {
      return eachMonthOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
      }).map((m) => ({
        start: startOfMonth(m),
        end: endOfMonth(m),
      }));
    }
    return [];
  }, [dateRange, isDateRangeValid]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const activeRange = monthsList.length > 0 ? monthsList[currentMonthIndex] : null;
  const monthLabel = activeRange ? format(activeRange.start, "MMMM yyyy") : '';

  const MetalTypeList = useMemo(() => {
    const baseAnalytics = new FactoryLossAnalytics(rawData);
    return baseAnalytics.getUniqueMetalTypes();
  }, [rawData]);

  const filtered = useMemo(() => {
    if (isDateRangeValid) {
      return filterFactoryLossData(rawData, {
        metalTypes: selectedTypes,
        date: dateRange,
      });
    }
    return [];
  }, [rawData, selectedTypes, dateRange, isDateRangeValid]);

  const analytics = new FactoryLossAnalytics(filtered);
  const categoryAnalysis = analytics.getCategoryGrouping();
  const dayAnalysis = analytics.getDayGrouping({
    startDate: activeRange ? activeRange.start : new Date(),
    endDate: activeRange ? activeRange.end : new Date(),
  });
  const rangeAnalysis = analytics.getRangeGrouping();
  const locationAnalysis = analytics.getLocationGrouping();
  const PureGrossLoss = analytics.getOverallFactoryLoss();

  const [categoryWiseAnalysis, setCategoryWiseAnalysis] = useState([]);
  const [dayWiseAnalysis, setDayWiseAnalysis] = useState([]);
  const [rangeWiseAnalysis, setRangeWiseAnalysis] = useState([]);
  const [locationWiseAnalysis, setLocationWiseAnalysis] = useState([]);
  const [PureGrossLossWise, setPureGrossLossWise] = useState(0);

  if (!rawData) {
    return <Loader msg="Loading Factory Loss Data" />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2 }, pb: { xs: 2, lg: 0 }, position: "relative", bgcolor: "#f9f9fb", height: "100%", overflowY: "auto" }}>
      <Header>
        <Typography variant="h5" fontWeight={600}>
          Factory Floor Loss Analysis
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: { xs: 2, sm: 0 } }}>
          <RefreshButton
            selectedTypes={selectedTypes}
            dateRange={dateRange}
            setCategoryWiseAnalysis={setCategoryWiseAnalysis}
            setDayWiseAnalysis={setDayWiseAnalysis}
            setRangeWiseAnalysis={setRangeWiseAnalysis}
            setLocationWiseAnalysis={setLocationWiseAnalysis}
            setPureGrossLossWise={setPureGrossLossWise}
            setLoadingComp={setRefreshLoading}
          />
          <RangeDatePicker value={dateRange} onChange={setDateRange} />
          <MetTypeSelect
            MetalTypeList={MetalTypeList}
            selected={selectedTypes}
            onChange={setSelectedTypes}
            disabled={!isDateRangeValid} 
          />
          <PureLossAnalyticsCard PureGrossLoss={PureGrossLoss} />
        </Box>
      </Header>

      {/* 3-Column Grid */}
      {isDateRangeValid && monthsList.length > 0 ? (
        <Grid container spacing={2} sx={{ mt: 0, height: "95%", pt: 0 }}>
          {/* First Row */}
          <Grid item xs={12} sx={{ height: "50%", pt: 0 }}>
            <Grid container columnSpacing={2} sx={{ height: "100%" }}>
              <Grid item md={4} xs={12} key={1} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CategoryBarChart categoryAnalysis={categoryAnalysis} />
                </Card>
              </Grid>
              {/* Second Row */}
              <Grid item md={4} xs={12} key={2} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <LossTable rangeAnalysis={rangeAnalysis} />
                </Card>
              </Grid>
              {/* Third Row */}
              <Grid item md={4} xs={12} key={3} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <LocationLossChart locationAnalysis={locationAnalysis} />
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Full Width Grid */}
          <Grid item xs={12} sx={{ height: "50%", pt: 0 }}>
            <Card sx={{ height: "97%" }}>
              <ProcessLossChart
                dayAnalysis={dayAnalysis}
                monthLabel={monthLabel}
                onPrev={() => setCurrentMonthIndex((i) => i - 1)}
                onNext={() => setCurrentMonthIndex((i) => i + 1)}
                disablePrev={!isMultiMonth || currentMonthIndex === 0}
                disableNext={!isMultiMonth || currentMonthIndex === monthsList.length - 1}
              />
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          gap={1}
        >
          <Typography variant="h6" color="error">
            Invalid date range selected.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a valid date range.
          </Typography>
        </Box>
      )}

      {refreshLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(2px)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={60} color="primary" />
          </Box>
      )}
    </Box>
  );
}
