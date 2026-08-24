import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import APP_CONFIG from "../config/constants";
import { useSafeAreaBottom } from "../SafeAreaFile";

export const EcomContext = createContext();

export const EcomContextProvider = ({ children }) => {
  const { adminUser } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [toggleRefresh, setToggleRefresh] = useState(false);
  // Lift the toast above the bottom footer/safe-area (not flush at the edge).
  const safeAreaBottom = useSafeAreaBottom();
  // Lightweight single toast for cart/wishlist feedback (no per-card snackbars).
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const notify = useCallback(
    (message, severity = "success") =>
      setSnack({ open: true, message, severity }),
    [],
  );

  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const storeID = APP_CONFIG.STORE_ID;
  const branchID = APP_CONFIG.BRANCH;
  // Tells the backend whether tagno values refer to tagno_alpha (1) or tagno (0)
  const isAlpha = APP_CONFIG.IS_ALPHA;

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!adminUser?.user_id) return;
    setWishlistLoaded(false);
    try {
      const response = await axios.get(`${baseURL}/api/e-com/wishlist`, {
        params: {
          store_id: storeID,
          user_id: adminUser.user_id,
          branch_id: branchID,
          is_alpha: isAlpha,
        },
      });

      const items = response.data?.data || [];
      setWishlistItems(items);
      // Count only usable rows (stock present) — dead/unavailable rows are
      // hidden by the screens, so the badge must not count them either.
      setWishlistCount(items.filter((i) => i.stock && !i.unavailable).length);
      setWishlistLoaded(true);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
      setWishlistCount(0);
      setWishlistLoaded(true);
    }
  }, [adminUser?.user_id, baseURL, storeID, branchID, isAlpha]);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    if (!adminUser?.user_id) return;
    setCartLoaded(false);
    try {
      const response = await axios.get(`${baseURL}/api/e-com/cart`, {
        params: {
          store_id: storeID,
          user_id: adminUser.user_id,
          branch_id: branchID,
          is_alpha: isAlpha,
        },
      });

      const items = response.data?.data || [];
      setCartItems(items);
      // Same rule as the wishlist: badge counts only usable rows.
      setCartCount(items.filter((i) => i.stock && !i.unavailable).length);
      setCartLoaded(true);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartCount(0);
      setCartLoaded(true);
    }
  }, [adminUser?.user_id, baseURL, storeID, branchID, isAlpha]);

  // Toggle wishlist item
  const toggleWishlist = useCallback(
    async (tagno) => {
      if (!adminUser?.user_id) {
        console.error("User not logged in");
        return { success: false };
      }

      try {
        setLoading(true);
        const response = await axios.post(
          `${baseURL}/api/e-com/wishlist/toggle`,
          {
            store_id: storeID,
            user_id: adminUser.user_id,
            tagno: tagno,
            branch_id: branchID,
            is_alpha: isAlpha,
          },
        );

        // Refresh wishlist after toggle
        await fetchWishlist();

        setLoading(false);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        setLoading(false);
        return { success: false, error };
      }
    },
    [adminUser?.user_id, baseURL, storeID, branchID, isAlpha, fetchWishlist],
  );

  // Toggle cart item
  const toggleCart = useCallback(
    async (tagno) => {
      if (!adminUser?.user_id) {
        console.error("User not logged in");
        return { success: false };
      }

      const wasInCart = cartItems.some((i) => i.stock?.tagno === tagno);
      try {
        setLoading(true);
        const response = await axios.post(`${baseURL}/api/e-com/cart/toggle`, {
          store_id: storeID,
          user_id: adminUser.user_id,
          tagno: tagno,
          branch_id: branchID,
          is_alpha: isAlpha,
        });

        // Refresh cart after toggle
        await fetchCart();

        setLoading(false);
        notify(wasInCart ? "Removed from cart" : "Added to cart");
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error toggling cart:", error);
        setLoading(false);
        return { success: false, error };
      }
    },
    [
      adminUser?.user_id,
      cartItems,
      baseURL,
      storeID,
      branchID,
      isAlpha,
      fetchCart,
      notify,
    ],
  );

  // Check if item is in wishlist. `stock` can be null when the row points at
  // a tagno that no longer exists for this store/branch (unavailable: true).
  const isInWishlist = useCallback(
    (tagno) => {
      if (!wishlistLoaded) return false;
      return wishlistItems.some((item) => item.stock?.tagno === tagno);
    },
    [wishlistLoaded, wishlistItems],
  );

  // Check if item is in cart (same null-stock guard as above)
  const isInCart = useCallback(
    (tagno) => {
      if (!cartLoaded) return false;
      return cartItems.some((item) => item.stock?.tagno === tagno);
    },
    [cartLoaded, cartItems],
  );

  const handleToggleRefresh = useCallback(() => {
    setToggleRefresh((prev) => !prev);
  }, []);

  // Fetch both on mount and when user changes
  useEffect(() => {
    if (adminUser?.user_id) {
      fetchWishlist();
      fetchCart();
    } else {
      // Reset if user logs out
      setWishlistItems([]);
      setCartItems([]);
      setWishlistCount(0);
      setCartCount(0);
    }
  }, [adminUser?.user_id, toggleRefresh, fetchWishlist, fetchCart]);

  const contextValue = useMemo(
    () => ({
      wishlistItems,
      cartItems,
      wishlistCount,
      cartCount,
      loading,
      wishlistLoaded,
      handleToggleRefresh,
      toggleWishlist,
      toggleCart,
      isInWishlist,
      isInCart,
      fetchWishlist,
      fetchCart,
      notify,
    }),
    [
      wishlistItems,
      cartItems,
      wishlistCount,
      cartCount,
      loading,
      wishlistLoaded,
      handleToggleRefresh,
      toggleWishlist,
      toggleCart,
      isInWishlist,
      isInCart,
      fetchWishlist,
      fetchCart,
      notify,
    ],
  );

  return (
    <EcomContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: `calc(${safeAreaBottom} + 72px) !important` }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </EcomContext.Provider>
  );
};
