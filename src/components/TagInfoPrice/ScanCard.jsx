import { Box, Card, CardActions, CardContent, Divider, Grid, Typography } from "@mui/material";
import { parseLooseJSON } from "./MaterialTable";

const ScanCard = ({ product }) => {
  const diamonds = parseLooseJSON(product?.diajson || "[]");
  const stones = parseLooseJSON(product?.stonejson || "[]");

  const diamondQuality = diamonds?.[0]?.Quality || "";
  const diamondColor = diamonds?.[0]?.color || "";

  const stoneQuality = stones?.[0]?.Quality || "";
  const stoneColor = stones?.[0]?.color || "";

  return (
    <>
      <Grid item xs={12} sm={6} md={4} key={product?.ArticleId}>
        <Card variant="outlined" sx={{ height: "100%"}}>
          <CardContent sx={{pb:"16px !important" }} >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography variant="h6" component="div">
                {product?.["Metal Type"]} • {product?.["Metal Color"]}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {diamondQuality} - {diamondColor} • {stoneQuality} - {stoneColor}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Price
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ₹{Number(product?.priceMrp || 0).toFixed(2)}
              </Typography>
            </Box>

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
              <Typography variant="body2" color="text.secondary">
                ₹{Number(product?.tax?.total || 0).toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                pt: 1,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Total
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                ₹{(Number(product?.priceMrp || 0) + Number(product?.tax?.total || 0)).toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default ScanCard;
