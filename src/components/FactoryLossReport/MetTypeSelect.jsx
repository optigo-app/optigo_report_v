import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  ThemeProvider,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import { Datetheme } from "../../libs/data";

export default function MetTypeSelect({ selected = "", onChange, MetalTypeList = [], disabled }) {
  const renderSelected = (value) => {
    if (!value) return "";
    return (
      <Chip
        label={<Typography variant="caption">{value}</Typography>}
        size="small"
      />
    );
  };
  const handleChange = (event) => {
    onChange(event.target.value);
  };    

  // console.log("MetalTypeList", MetalTypeList);
  
  return (
    <ThemeProvider theme={Datetheme}>
      <Box sx={{ bgcolor: "#fff" }}>
        <FormControl sx={{ minWidth: 240 }} size="small" disabled={disabled}>
          <InputLabel id="mettype-label">Metal Type</InputLabel>
          <Select
            labelId="mettype-label"
            disabled={disabled}
            value={selected}
            onChange={handleChange}
            input={
              <OutlinedInput
                label="Metal Type"
                endAdornment={
                  selected ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        sx={{
                          p: 0.7,
                          mr: 1.5,
                          width: 30
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange("");
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              />
            }
            renderValue={renderSelected}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                },
              },
            }}
          >
            {MetalTypeList.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
}