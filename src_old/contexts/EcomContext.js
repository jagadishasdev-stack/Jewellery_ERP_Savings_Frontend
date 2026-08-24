import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import APP_CONFIG from "../config/constants";

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

  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const storeID = APP_CONFIG.STORE_ID;
  const branchID = APP_CONFIG.BRANCH;

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!adminUser?.user_id) return;
    setWishlistLoaded(false);
    try {
      const response = await axios.get(`${baseURL}/api/e-com/wishlist`, {
        params: {
          store_id: storeID,
          user_id: adminUser.user_id,
          branch_id: branchID,
        },
      });

      const items = response.data?.data || [];
      setWishlistItems(items);
      setWishlistCount(items.length);
      setWishlistLoaded(true);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
      setWishlistCount(0);
      setWishlistLoaded(true);
    }
  };

  // Fetch cart items
  const fetchCart = async () => {
    if (!adminUser?.user_id) return;
    setCartLoaded(false);
    try {
      const response = await axios.get(`${baseURL}/api/e-com/cart`, {
        params: {
          store_id: storeID,
          user_id: adminUser.user_id,
          branch_id: branchID,
        },
      });

      const items = response.data?.data || [];
      setCartItems(items);
      setCartCount(items.length);
      setCartLoaded(true);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartCount(0);
      setCartLoaded(true);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (tagno) => {
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
  };

  // Toggle cart item
  const toggleCart = async (tagno) => {
    if (!adminUser?.user_id) {
      console.error("User not logged in");
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/api/e-com/cart/toggle`, {
        store_id: storeID,
        user_id: adminUser.user_id,
        tagno: tagno,
        branch_id: branchID,
      });

      // Refresh cart after toggle
      await fetchCart();

      setLoading(false);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error toggling cart:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (tagno) => {
    if (!wishlistLoaded) return false;
    return wishlistItems.some((item) => item.stock.tagno === tagno);
  };

  // Check if item is in cart
  const isInCart = (tagno) => {
    if (!cartLoaded) return false;
    return cartItems.some((item) => item.stock.tagno === tagno);
  };

  const handleToggleRefresh = () => {
    setToggleRefresh((prev) => !prev);
  };

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
  }, [adminUser?.user_id, toggleRefresh]);

  return (
    <EcomContext.Provider
      value={{
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
      }}
    >
      {children}
    </EcomContext.Provider>
  );
};
