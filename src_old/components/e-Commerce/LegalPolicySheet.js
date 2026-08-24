import React from "react";
import { Box, Typography } from "@mui/material";
import BottomSheet from "./ui/BottomSheet";
import { INK, INK_SOFT, MUTED } from "./ui/ecomTokens";

// ─── LegalPolicySheet ────────────────────────────────────────────────────────
// Presentational bottom sheet showing Privacy Policy or Terms & Conditions.
// DUMMY content only — to be replaced with final legal text later. No data/API.
const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: [placeholder]",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "This is placeholder text. We collect the information necessary to process your orders and provide our services, such as your name, contact details and delivery address. Replace this section with your finalized privacy policy content.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "This is placeholder text. Your information is used to fulfil orders, provide customer support and improve your shopping experience. We do not sell your personal data to third parties.",
      },
      {
        heading: "3. Data Security",
        body: "This is placeholder text. We take reasonable measures to protect your personal information against unauthorised access, alteration or disclosure.",
      },
      {
        heading: "4. Contact Us",
        body: "This is placeholder text. For any questions regarding this Privacy Policy, please contact our support team. Final contact details will be added here.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "Last updated: [placeholder]",
    sections: [
      {
        heading: "1. General",
        body: "This is placeholder text. By placing an order through this application you agree to these Terms & Conditions. Replace this section with your finalized terms.",
      },
      {
        heading: "2. Orders & Pricing",
        body: "This is placeholder text. All prices are displayed inclusive of applicable charges shown at checkout. We reserve the right to update prices and product availability.",
      },
      {
        heading: "3. Buyback & Returns",
        body: "This is placeholder text. Eligible products are covered under our buyback policy subject to conditions. Details of returns and buyback eligibility will be specified here.",
      },
      {
        heading: "4. Limitation of Liability",
        body: "This is placeholder text. Our liability is limited to the value of the product purchased, to the extent permitted by applicable law.",
      },
    ],
  },
};

const LegalPolicySheet = ({ open, onClose, variant = "privacy" }) => {
  const doc = CONTENT[variant] || CONTENT.privacy;

  return (
    <BottomSheet open={open} onClose={onClose} title={doc.title} maxHeight="88vh">
      <Typography sx={{ fontSize: 11.5, color: MUTED, mb: 2 }}>
        {doc.updated}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {doc.sections.map((s) => (
          <Box key={s.heading}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: INK, mb: 0.5 }}
            >
              {s.heading}
            </Typography>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: INK_SOFT }}>
              {s.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </BottomSheet>
  );
};

export default LegalPolicySheet;
