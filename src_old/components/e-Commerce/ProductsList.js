import { Grid } from "@mui/material";
import React from "react";
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
          sm={4}
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
