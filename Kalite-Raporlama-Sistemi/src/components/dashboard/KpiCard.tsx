import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}

function KpiCard({ title, value, description, icon }: KpiCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 160,
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: 40,
              height: 40,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              backgroundColor: "action.hover",
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            marginTop: 1,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default KpiCard;
