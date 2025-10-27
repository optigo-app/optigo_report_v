import React from "react";
import { Paper, Box, Typography, Divider, Chip, IconButton, Popover, Tooltip, TableCell, Table, TableBody, TableHead, TableRow } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/material/styles";
import { getChipColorStyles } from "../../libs/function";
import { FixedSizeList as List } from "react-window";

const CompanyRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0.6, 0),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(1),
  },
}));

const CompanyDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const ValueGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
}));

const FooterSummary = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  bottom: 0,
}));

// Styled component for virtualized table row
const VirtualTableRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0.5, 0),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const VirtualTableCell = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1),
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
}));

const CompanyTypeList = ({ companyTypeSummary }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState(null);
  const formattedData = companyTypeSummary?.map((item) => ({
    type: item?.companyType,
    orders: item?.totalJobs,
    delayed: item?.delayedJobs,
    delayPercent: item?.delayPercent,
    items: item?.items,
  }));

  const handleOpen = (e, items, type) => {
    setAnchorEl(e.currentTarget);
    setSelectedItems(items);
    setSelectedType(type);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItems([]);
    setSelectedType(null);
  };

  const open = Boolean(anchorEl);

  const totalOrders = formattedData?.reduce((sum, c) => sum + c.orders, 0);
  const totalDelayed = formattedData?.reduce((sum, c) => sum + c.delayed, 0);
  const overallDelayPercent = totalOrders > 0 ? (totalDelayed / totalOrders) * 100 : 0;


  return (
    <>
      <Typography variant="h6" mb={2}>
        Company Type Wise Details
      </Typography>
      <Box sx={{ height: 380, width: "100%", overflowY: "auto" }}>
        {formattedData?.map((row, index) => (
          <React.Fragment key={index}>
            <CompanyRow>
              <CompanyDetails>
                <Tooltip title="View Items" arrow>
                  <IconButton size="small" onClick={(e) => handleOpen(e, row.items, row.type)}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography fontWeight={500}>{row?.type}</Typography>
              </CompanyDetails>

              <ValueGroup>
                <Typography variant="body2" color="text.secondary">
                  Orders: <strong>{row?.orders?.toLocaleString()}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delayed: <strong>{row?.delayed?.toLocaleString()}</strong>
                </Typography>
                <Chip
                  label={`${row?.delayPercent?.toFixed(2)}%`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 3,
                    ...getChipColorStyles(row?.delayPercent),
                  }}
                />
              </ValueGroup>
            </CompanyRow>
            {index !== formattedData?.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}

      {!!formattedData?.length && <FooterSummary>
          <Typography variant="subtitle1" fontWeight={600}>
            Total Orders: {totalOrders?.toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            Total Delayed: {totalDelayed?.toLocaleString()}
          </Typography>
          <Chip
            label={
              <Typography variant="subtitle1" fontWeight={600}>
                Overall Delay: {overallDelayPercent?.toFixed(2)}%
              </Typography>
            }
            size="medium"
            sx={{ fontWeight: 600, fontSize: "1rem", ...getChipColorStyles(overallDelayPercent) }}
          />
        </FooterSummary>}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            p: 0,
            borderRadius: 2,
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
            minWidth: 600,
            maxWidth: 800,
          },
        }}
      >
        <PremiumTable selectedType={selectedType} selectedItems={selectedItems} />
      </Popover>
    </>
  );
};

export default CompanyTypeList;

function PremiumTable({ selectedItems, selectedType }) {
  const totalQty = selectedItems.length;
  const totalDelayOrders = selectedItems.filter(
    (item) => parseFloat(item["deliveryage"]) < 0
  ).length;

  const avgDelayPercent = totalQty ? (totalDelayOrders / totalQty) * 100 : 0;

  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 100;
  const MAX_HEIGHT = 400;
  const LIST_HEIGHT = Math.min(selectedItems.length * ROW_HEIGHT, MAX_HEIGHT - HEADER_HEIGHT);

  const VirtualRow = ({ index, style }) => {
    const item = selectedItems[index];
    const delayAge = parseFloat(item["deliveryage"]) || 0;
    const isEven = index % 2 === 0;

    return (
      <div style={style}>
        <VirtualTableRow
          sx={{
            backgroundColor: isEven ? "#fafafa" : "transparent",
            margin: 0,
            height: ROW_HEIGHT,
          }}
        >
          <VirtualTableCell sx={{ width: "60px", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {index + 1}
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "80px" }}>
            <Typography variant="body2" fontWeight={500}>
              {item["JobNo"]}
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "200px" }}>
            <Typography variant="body2">{item["designno"]}</Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "140px" }}>
            <Typography variant="body2">{item["customercode"]}</Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "120px", justifyContent: "flex-end" }}>
            <Chip
              label={delayAge}
              size="small"
              color={delayAge < 0 ? "error" : "success"}
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
                height: 22,
                borderRadius: 4,
                minWidth: "50px",
              }}
            />
          </VirtualTableCell>
        </VirtualTableRow>
      </div>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          backgroundColor: "#f9fafb",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} mb={1} px={2} pt={2}>
          {selectedType}
        </Typography>

        <Box display="flex" gap={2} mb={1.5} flexWrap="wrap" px={2}>
          <Typography variant="caption" color="text.secondary">
            Total Items: <strong>{totalQty}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Delay Orders: <strong>{totalDelayOrders}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Delay %:
            <Chip
              label={`${avgDelayPercent.toFixed(2)}%`}
              size="small"
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
                height: 20,
                borderRadius: 2,
                ml: 0.5,
                ...getChipColorStyles(avgDelayPercent),
              }}
            />
          </Typography>
        </Box>

        {/* TABLE HEADER */}
        <VirtualTableRow
          sx={{
            backgroundColor: "#f0f0f0",
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
            fontWeight: 600,
          }}
        >
          <VirtualTableCell sx={{ width: "60px", justifyContent: "center" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              #
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "80px" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Job No.
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "200px" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Design No.
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "140px" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Customer
            </Typography>
          </VirtualTableCell>

          <VirtualTableCell sx={{ width: "120px", justifyContent: "flex-end" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Delay Age
            </Typography>
          </VirtualTableCell>
        </VirtualTableRow>
      </Box>

      {/* VIRTUALIZED LIST */}
      {selectedItems.length > 0 && (
        <List
          height={LIST_HEIGHT}
          itemCount={selectedItems.length}
          itemSize={ROW_HEIGHT}
          width="100%"
        >
          {VirtualRow}
        </List>
      )}

      {selectedItems.length === 0 && (
        <Box p={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            No items to display
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

