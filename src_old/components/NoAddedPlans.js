import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../theme";
import storeLogo from "../assets/img/logo/logo.png";
// import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

// Images
// import GiftCard1 from "../assets/img/icons/GiftCard1.jpg";
// import GiftCard2 from "../assets/img/icons/GiftCard2.jpg";
// import TrendingCard1 from "../assets/img/icons/trendingCardPendent.png";
// import TrendingCard2 from "../assets/img/icons/trendingCardBangles.png";

// Icon
// import ShortcutRoundedIcon from "@mui/icons-material/ShortcutRounded";
import CardIcon from "../assets/img/icons/card-pos.svg";

function NoAddedPlans() {
  const navigate = useNavigate();
  const [logoOrientation, setLogoOrientation] = useState("square");

  function getLogoOrientation(width, height) {
    const ratio = width / height;
    if (ratio > 1.2) return "horizontal";
    if (ratio < 0.8) return "vertical";
    return "square";
  }

  // useEffect(() => {
  //   const img = new Image();
  //   img.src = storeLogo;
  //   img.onload = () => {
  //     const orientation = getLogoOrientation(img.naturalWidth, img.naturalHeight);
  //     setLogoOrientation(orientation);
  //   };
  // }, [storeLogo]);

  const handleRedirect = () => {
    navigate("/select-plan");
  };

  // const giftCardImagesArr = [GiftCard1, GiftCard2];
  // const giftCardOccassionDetails = ["Birthday", "Celebrate"];

  // Slider functionality
  // const giftCardSliderSettings = {
  //   dots: false,
  //   infinite: true,
  //   slidesToShow: 1,
  //   arrows: false,
  //   autoplay: true,
  //   autoplaySpeed: 3000,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 1,
  //       },
  //     },
  //     {
  //       breakpoint: 600,
  //       settings: {
  //         slidesToShow: 1,
  //       },
  //     },
  //     {
  //       breakpoint: 480,
  //       settings: {
  //         slidesToShow: 1,
  //       },
  //     },
  //   ],
  // };

  return (
    <React.Fragment>
      <Box
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
        width="100%"
      >
        {/* My plans */}
        <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="column"
          width="100%"
          mb={3}
        >
          {/* Heading */}
          <Typography
            variant="body1"
            color={theme.colors.primaryHeading}
            fontWeight={500}
            mb={1}
          >
            My Plans
          </Typography>
          {/* Description */}
          <Typography fontSize={12} color={theme.noAddedPlans.textCol}>
            Gold Plan is a simple and easy way for investments and saving for
            jewellery purchase. Enroll for new schemes or pay your monthly
            installments here.
          </Typography>
        </Box>

        {/* Enroll now card */}
      <Box
  display="flex"
  justifyContent="center"
  alignItems="center"
  flexDirection="column"
  width="100%"
  mb={3}
  sx={{
    bgcolor: theme.noAddedPlans.enrollNowCardBgCol,
    border: `1px solid ${theme.noAddedPlans.enrollNowCardBorderCol}`,
    padding: "2rem 1.2rem",
    borderRadius: 2,
    gap: "1rem",
  }}
>
  {/* Icon */}
  <Box
    component="img"
    src={CardIcon}
    alt="Card Icon"
    sx={{ height: 40, width: 40, opacity: 0.75 }}
  />

  {/* Tag line */}
  <Typography
    fontSize={15}
    fontWeight={600}
    textAlign="center"
    color={theme.colors.primaryHeading}
    lineHeight={1.5}
  >
    You don't have any active plan yet
  </Typography>

  {/* Sub text */}
  <Typography
    fontSize={12}
    textAlign="center"
    color={theme.noAddedPlans.textCol}
    lineHeight={1.6}
  >
    Owning your dream jewellery is now made simple and easy.{"\n"}
    Enroll in a Jewellery Savings Plan today and start saving towards
    the jewellery you truly desire.
  </Typography>

  {/* CTA Button */}
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    width="70%"
    sx={{
      bgcolor: theme.noAddedPlans.fillCol,
      borderRadius: 2,
      padding: "0.65rem",
      cursor: "pointer",
      boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
    }}
    onClick={handleRedirect}
  >
    <Typography color="#fffefa" fontSize={13} fontWeight={600} letterSpacing={0.5}>
      ✦ Start My Savings Plan
    </Typography>
  </Box>
</Box>

        {/* Gift cards */}
        {/* <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="column"
          width="100%"
          mb={3}
        >
          
          <Typography
            variant="body1"
            color={theme.colors.primaryHeading}
            fontWeight={500}
            mb={2}
          >
            Gift Cards
          </Typography>

          
          <Box sx={{ width: "100%" }}>
            <Slider {...giftCardSliderSettings}>
              {giftCardImagesArr.map((curImg, index) => (
                <Box
                  key={index}
                  height="22.5vh"
                  sx={{
                    width: "100%",
                    minWidth: "100%",
                    backgroundImage: `url(${curImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: 3,
                    position: "relative",
                  }}
                >
                  
                  <Box
                    sx={{
                      position: "absolute",
                      top: "5%",
                      left: "5%",
                      width:
                        logoOrientation === "vertical"
                          ? 30
                          : logoOrientation === "horizontal"
                            ? 55
                            : 40,
                      height:
                        logoOrientation === "vertical"
                          ? 55
                          : logoOrientation === "horizontal"
                            ? 30
                            : 40,
                      backgroundImage: `url(${storeLogo})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      // filter: "brightness(0) invert(1)",
                    }}
                  />

                  
                  <Box
                    width={100}
                    sx={{
                      position: "absolute",
                      top: "30%",
                      right: "3%",
                    }}
                  >
                    <Typography
                      fontSize={16}
                      sx={{
                        fontFamily: "Beau Rivage",
                        color: "#FFFEFE",
                        letterSpacing: 2,
                      }}
                    >
                      The newest collection of mahalakshmi
                    </Typography>
                  </Box>

                  
                  <Typography
                    fontSize={19}
                    fontWeight={600}
                    sx={{
                      position: "absolute",
                      bottom: "10%",
                      left: "5%",
                      color: "#fff",
                      letterSpacing: 2,
                    }}
                  >
                    {giftCardOccassionDetails[index]}
                  </Typography>

                  
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "15%",
                      right: "10%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Typography
                      fontSize={11}
                      color={theme.noAddedPlans.giftCardSeeMoreTextCol}
                    >
                      See more
                    </Typography>
                    <ShortcutRoundedIcon
                      sx={{
                        fontSize: 14,
                        transform: "rotateX(180deg)",
                        fill: "#fff",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Slider>
          </Box>
        </Box> */}

        {/* Trending */}
        {/* <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="column"
          width="100%"
          mb={7}
        >
          
          <Typography
            variant="body1"
            color={theme.colors.primaryHeading}
            fontWeight={500}
            mb={2}
          >
            Trending
          </Typography>

         
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            gap="0.8rem"
            width="100%"
          >
            
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              paddingLeft="0.8rem"
              sx={{
                bgcolor: theme.noAddedPlans.trendingCardBgCol,
                borderRadius: 2,
              }}
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
                flexDirection="column"
                height={66}
              >
                <Typography
                  variant="body1"
                  color={theme.colors.primaryHeading}
                  fontWeight={500}
                >
                  Stylish Pendant
                </Typography>
                <Typography color={theme.noAddedPlans.textCol}>
                  Curated for you
                </Typography>
              </Box>
              <Box
                height="66px"
                width="22%"
                sx={{
                  backgroundImage: `url(${TrendingCard1})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </Box>

            
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              paddingLeft="0.8rem"
              sx={{
                bgcolor: theme.noAddedPlans.trendingCardBgCol,
                borderRadius: 2,
              }}
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
                flexDirection="column"
                height={66}
              >
                <Typography
                  variant="body1"
                  color={theme.colors.primaryHeading}
                  fontWeight={500}
                >
                  Daily wear Rings
                </Typography>
                <Typography color={theme.noAddedPlans.textCol}>
                  Your go to rings for everyday
                </Typography>
              </Box>
              <Box
                height="66px"
                width="22%"
                sx={{
                  backgroundImage: `url(${TrendingCard2})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </Box>
          </Box>
        </Box> */}
      </Box>
    </React.Fragment>
  );
}

export default NoAddedPlans;
