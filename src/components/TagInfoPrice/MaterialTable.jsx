import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
} from "@mui/material";

// Loose JSON parser (kept same)
export function parseLooseJSON(str) {
  if (!str || typeof str !== "string") return [];
  try {
    let fixed = str.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    fixed = fixed.replace(
      /:\s*([a-zA-Z0-9]+[a-zA-Z]+[a-zA-Z0-9]*)\s*([,}])/g,
      ':"$1"$2'
    );
    return JSON.parse(fixed);
  } catch (e) {
    console.error("Failed to parse JSON:", e, str);
    return [];
  }
}

// Container: responsive scroll wrapper
const CompactTableContainer = styled(TableContainer)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(3),
  overflowX: "auto", // horizontal scroll on small screens
  "&::-webkit-scrollbar": {
    height: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
  },
}));

// Table: responsive font + sticky headers
const CompactTable = styled(Table)(({ theme }) => ({
  borderCollapse: "collapse",
  "& th, & td": {
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  "& th": {
    fontWeight: 600,
    background: theme.palette.action.hover,
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  "& tr:hover td": {
    background: theme.palette.action.focus,
  },
  [theme.breakpoints.down("sm")]: {
    "& th, & td": {
      fontSize: 12,
    },
  },
}));

export default function TableSection({ title, data }) {
  const rows = parseLooseJSON(data);
  if (rows?.length === 0) return null;

  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{ mb: 1, fontWeight: 600, fontSize: { xs: 14, sm: 15 } }}
      >
        {title}
      </Typography>
      <CompactTableContainer component={Paper}>
        <CompactTable size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shape</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Pieces</TableCell>
              <TableCell>Wt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row?.shape}</TableCell>
                <TableCell>{row?.Quality}</TableCell>
                <TableCell>{row?.color}</TableCell>
                <TableCell>{row?.size}</TableCell>
                <TableCell>{row?.pieces}</TableCell>
                <TableCell>{row?.ctw}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      </CompactTableContainer>
    </Box>
  );
}
