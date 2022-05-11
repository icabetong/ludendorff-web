import React from "react";
import { HighlightProps, connectHighlight } from "react-instantsearch-core";
import { Box } from "@mui/material";

const Highlight = ({ highlight, attribute, hit }: HighlightProps) => {
  const parsedHit = highlight({
    highlightProperty: '_highlightResult',
    attribute,
    hit
  });

  return (
    <span>
      {parsedHit.map((part, index) =>
        part.isHighlighted ? (
          <Box
            key={index}
            component="span"
            sx={{ color: (theme) => theme.palette.primary.main }}>
            {part.value}
          </Box>
        ) : (
          <span key={index}>{part.value}</span>
        ))
      }
    </span>
  )
}

export default connectHighlight(Highlight);
