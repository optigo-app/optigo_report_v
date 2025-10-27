import { useMemo, useState } from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
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
import { startOfMonth, endOfMonth } from "date-fns";
import Loader from "../shared/Loader";

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
  console.log("🚀 ~ FactoryLossReport ~ rawData:", rawData)
  const defaultStart = startOfMonth(new Date());
  const defaultEnd = endOfMonth(new Date());
  const defaultSelectedDate = { startDate: defaultStart, endDate: defaultEnd };
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dateRange, setDateRange] = useState(defaultSelectedDate);

  const filtered = useMemo(() => {
    return filterFactoryLossData(rawData, {
      metalTypes: selectedTypes,
      date: dateRange,
    });
  }, [rawData, selectedTypes, dateRange]);

  const analytics = new FactoryLossAnalytics(filtered);
  const categoryAnalysis = analytics.getCategoryGrouping();
  const dayAnalysis = analytics.getDayGrouping(dateRange);
  const rangeAnalysis = analytics.getRangeGrouping();
  const locationAnalysis = analytics.getLocationGrouping();
  const PureGrossLoss = analytics.getOverallFactoryLoss();
  const MetalTypeList = useMemo(() => {
    const baseAnalytics = new FactoryLossAnalytics(rawData);
    return baseAnalytics.getUniqueMetalTypes();
  }, [rawData]);

  if(!rawData){
    return <Loader msg="Loading Factory Loss Data"/>
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f9f9fb",height: "100%",
    overflowY: "auto", }}>
      <Header>
        <Typography variant="h5" fontWeight={600}>
          Factory Floor Loss Analysis
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: { xs: 2, sm: 0 } }}>
          <RangeDatePicker value={dateRange} onChange={setDateRange} />
          <MetTypeSelect MetalTypeList={MetalTypeList} selected={selectedTypes} onChange={(e) => setSelectedTypes(e.target.value)} />
          <PureLossAnalyticsCard PureGrossLoss={PureGrossLoss} />
        </Box>
      </Header>
      {/* 3-Column Grid */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* First Row */}
        <Grid item md={4} xs={12} key={1}>
          <Card>
            <CategoryBarChart categoryAnalysis={categoryAnalysis} />
          </Card>
        </Grid>
        {/* Second Row */}
        <Grid item md={4} xs={12} key={2}>
          <Card>
            <LossTable rangeAnalysis={rangeAnalysis} />
          </Card>
        </Grid>
        {/* Third Row */}
        <Grid item md={4} xs={12} key={3}>
          <Card>
            <LocationLossChart locationAnalysis={locationAnalysis} />
          </Card>
        </Grid>

        {/* Full Width Grid */}
        <Grid item md={12} xs={12}>
          <Card sx={{ height: 390 }}>
            <ProcessLossChart dayAnalysis={dayAnalysis} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
