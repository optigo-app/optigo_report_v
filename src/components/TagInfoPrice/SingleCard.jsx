import React from "react";
import { Box, Button, Card, Grid, Typography } from "@mui/material";
import TableSection from "./MaterialTable";
import NoImage from "../../assets/no.jpg";

const SingleCard = ({ SelectedJob, setShowAll }) => {
  return (
    <>
      {/* Header Notice */}
      <Box
        sx={{
          textAlign: "center",
          mb: 3,
          p: { xs: 2, sm: 3 },
          bgcolor: "#f0f8ff",
          borderRadius: 2,
          border: "1px solid #e0eafc",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          Matched Designs Found!
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Showing result for scanned item
        </Typography>
        <Button
          size="small"
          variant="contained"
          color="primary"
          sx={{ mt: 1, textTransform: "none" }}
          onClick={() => setShowAll(true)}
        >
          Show More Designs
        </Button>
      </Box>

      {/* Main Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: { md: "translateY(-4px)" },
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.12)",
          },
          bgcolor: "#fff",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Left: Image */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={SelectedJob?.Imagesrc}
                onError={(e) => (e.target.src = NoImage)}
                alt="Diamond"
                sx={{
                  width: "100%",
                  height: { xs: 220, sm: 300, md: "100%" },
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  objectFit: "contain",
                  bgcolor: "background.default",
                }}
              />
            </Grid>

            {/* Middle: Tables */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TableSection
                  key={`${SelectedJob?.ArticleId}-dia`}
                  title="Diamond"
                  data={SelectedJob?.diajson}
                />
                <TableSection
                  key={`${SelectedJob?.ArticleId}-stone`}
                  title="Color Stone"
                  data={SelectedJob?.stonejson}
                />
                <TableSection
                  key={`${SelectedJob?.ArticleId}-misc`}
                  title="Misc"
                  data={SelectedJob?.miscjson}
                />
              </Box>
            </Grid>

            {/* Right: Job Details */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Job Details
              </Typography>
              <Grid container spacing={2}>
                {/* Metal Type */}
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Karat/Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {SelectedJob?.["Metal Type"] || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* Color */}
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Color
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {SelectedJob?.["Metal Color"] || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* Price Section */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      p: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      backgroundColor: (theme) =>
                        theme.palette.background.paper,
                    }}
                  >
                    {/* Base Price */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Base Price
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color="primary"
                      >
                        ₹{Number(SelectedJob?.priceMrp || 0).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Tax */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tax
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color="primary"
                      >
                        ₹{Number(SelectedJob?.tax?.total || 0).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Divider + Total */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pt: 1,
                        mt: 0.5,
                        borderTop: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        Total
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        ₹
                        {(
                          Number(SelectedJob?.priceMrp || 0) +
                          Number(SelectedJob?.tax?.total || 0)
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  );
};

export default SingleCard;
