import React, { useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { Box, Typography } from "@mui/material";
import theme from "../theme";
import Slider from "react-slick";
import { ReactComponent as SearchIcon } from "../assets/img/icons/footer-search.svg";

const SearchCategories = ({
  searchTerm,
  filteredCategories,
  setSearchTerm,
}) => {
  const { storeAssets } = useContext(StoreContext);
  const { categories = [] } = storeAssets || {};

  const suggestion = categories.map((item) => item.name).slice(0, 5);

  const categorySliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box>
      {/* Slider Section */}
      {categories.length > 0 ? (
        <Box sx={{ my: 2 }}>
          <Slider {...categorySliderSettings}>
            {categories.map((category) => (
              <Box
                key={category.id}
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ p: 1 }}
                onClick={() => setSearchTerm(category.name)}
              >
                <Box
                  sx={{
                    height: "50px",
                    width: "50px",
                    margin: "0 auto",
                    backgroundImage: `url(${category.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: "50px",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 1,
                    color: theme.colors.subHeading,
                    p: 0.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "110px",
                    textAlign: "center",
                    width: "100%",
                    fontSize: "12px",
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ textAlign: "center", mb: 4 }}
        >
          No categories found
        </Typography>
      )}

      {/* Suggestions Section */}
      {!searchTerm && (
        <>
          <Typography>Suggestion</Typography>
          {suggestion.map((item, index) => (
            <Typography
              onClick={() => setSearchTerm(item)}
              key={index}
              sx={{ color: "gray", marginY: 1 }}
            >
              <SearchIcon style={{ width: "15px", marginRight: "5px" }} />{" "}
              {item}
            </Typography>
          ))}
        </>
      )}

      {/* Filtered Categories Section */}
      {searchTerm.trim() !== "" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
            mt: 2,
          }}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Box
                key={category.id}
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{
                  p: 1,
                  width: "100%", // make it grow within grid cell
                }}
              >
                <Box
                  sx={{
                    height: "120px",
                    width: "100%",
                    backgroundImage: `url(${category.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: 2,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 1,
                    color: theme.colors.subHeading,
                    p: 0.5,
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    width: "100%",
                    fontSize: "12px",
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center", gridColumn: "span 2", mb: 4 }}
            >
              No categories found for "{searchTerm}"
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchCategories;
