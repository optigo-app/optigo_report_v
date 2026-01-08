// src/components/RefreshButton.js
import React, { useState } from 'react';
import { Box, Button, styled } from '@mui/material';
import { useFactoryLoss } from './../../context/FactoryLossReport';
import FactoryLossAnalytics from '../../analytics/FactoryLossAnalytics';
import { filterFactoryLossData } from '../../libs/FactoryLossFilter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { keyframes } from '@mui/system';

export default function RefreshButton({
  selectedTypes, 
  dateRange,
  setCategoryWiseAnalysis,
  setDayWiseAnalysis,
  setRangeWiseAnalysis,
  setLocationWiseAnalysis,
  setPureGrossLossWise,
  setLoadingComp,
}) {
  const { rawData } = useFactoryLoss();
  const [internalLoading, setInternalLoading] = useState(false);

  const handleRefresh = async () => {
    setInternalLoading(true);
    setLoadingComp(true);

    setTimeout(() => {
      const refreshedData = filterFactoryLossData(rawData, {
        metalTypes: selectedTypes,
        date: dateRange,
      });

      const refreshedAnalytics = new FactoryLossAnalytics(refreshedData);

      setCategoryWiseAnalysis(refreshedAnalytics.getCategoryGrouping());
      setDayWiseAnalysis(refreshedAnalytics.getDayGrouping({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
      setRangeWiseAnalysis(refreshedAnalytics.getRangeGrouping());
      setLocationWiseAnalysis(refreshedAnalytics.getLocationGrouping());
      setPureGrossLossWise(refreshedAnalytics.getOverallFactoryLoss());

      setInternalLoading(false);
      setLoadingComp(false);
    }, 1500);
  };

  const RefreshButtonStyled = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,     // use theme radius
    textTransform: 'none',
    fontWeight: 500,
    fontSize: 14,
    padding: theme.spacing(0.9, 2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.divider,
    },
  }));

  const spin = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `;

  const RotatingAutorenewIcon = styled(AutorenewIcon)(({ loading }) => ({
    animation: loading ? `${spin} 1s linear infinite` : 'none',
  }));

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
     <RefreshButtonStyled
        onClick={handleRefresh}
        startIcon={<RotatingAutorenewIcon loading={internalLoading ? 1 : 0} />}
        // startIcon={<AutorenewIcon />}
      >
        Refresh
      </RefreshButtonStyled>
    </Box>
  );
}
