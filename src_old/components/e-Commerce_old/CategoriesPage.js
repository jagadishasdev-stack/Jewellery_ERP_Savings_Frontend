import React, { useContext } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { Box, Grid, Typography, Button } from "@mui/material";
import theme from "../../theme";
import { useNavigate } from "react-router-dom";

import braceleteImg from "../../assets/img/icons/braceletImg.png";
import earringsImg from "../../assets/img/icons/earringsImg.png";
import bangleImg from "../../assets/img/icons/bangleImg.png";
import jeweleryImg from "../../assets/img/icons/jeweleryImg.png";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { storeAssets } = useContext(StoreContext);
  const { categories = [] } = storeAssets || {};

  const dummyCategory = [
    { id: 1, name: "Bangles", icon: braceleteImg, productType: "Bangle" },
    { id: 2, name: "Chains", icon: earringsImg, productType: "Chain" },
    { id: 3, name: "Rings", icon: bangleImg, productType: "Ring" },
    { id: 4, name: "Earrings", icon: jeweleryImg, productType: "Earring" },
    { id: 5, name: "Bracelets", icon: braceleteImg, productType: "Bracelet" },
    { id: 6, name: "Kadas", icon: earringsImg, productType: "Kada" },
    { id: 7, name: "Necklaces", icon: jeweleryImg, productType: "Necklace" },
    { id: 8, name: "Mangttikas", icon: bangleImg, productType: "Mangttika" },
  ];

  const color = [
    "#F8F0DD",
    "#EDBBA2",
    "#EDBBA2",
    "#F8F0DD",
    "#F1E5D7",
    "#EED9C4",
    "#F8F0DD",
    "#F8F0DD",
    "#EED9C4",
    "#FFDCDC",
  ];

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        pt: 2,
        pb: 6,
      }}
    >
      {/* --- Header Row with Skip Button --- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.categoriesPage.categoryHeadingCol,
            fontSize: "18px",
          }}
        >
          Select Category
        </Typography>

        <Button
          variant="text"
          onClick={() => navigate("/products")}
          sx={{
            cursor: "pointer",
            textTransform: "none",
            color: theme.categoriesPage.skipCategoryTextCol,
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Skip
        </Button>
      </Box>

      {/* --- Category Grid --- */}
      {categories.length > 0 ? (
        <Box sx={{ my: 1.2 }}>
          <Grid container spacing={2}>
            {dummyCategory.map((category, index) => (
              <Grid item xs={6} key={category.id}>
                <Box
                  onClick={() =>
                    navigate("/products", {
                      state: { productCategory: category.productType },
                    })
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1,
                    bgcolor: color[index % color.length],
                    borderRadius: "10px",
                    overflow: "hidden",
                    height: "80px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      color: theme.colors.subHeading,
                      p: 0.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "110px",
                      fontWeight: 500,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Box
                    sx={{
                      height: "100%",
                      width: "30%",
                      backgroundImage: `url(${category.icon})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          No categories found
        </Typography>
      )}
    </Box>
  );
};

export default CategoriesPage;
