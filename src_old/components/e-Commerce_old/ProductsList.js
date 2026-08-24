import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import ProductViewer from "./ProductViewer";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const ProductsList = ({ allProducts = [] }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={1.5}>
      {allProducts?.map((product) => (
        <Grid
          item
          xs={6}
          key={product.tagno}
          onClick={() => navigate("/e-com/product", { state: product })}
        >
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductsList;
