import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
const Loader = ({msg}) => {
    return (

        <>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" gap={2}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">
                   {msg}
                </Typography>
            </Box>
        </>
    )
}

export default Loader