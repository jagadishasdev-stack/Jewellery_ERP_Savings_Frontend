import { registerPlugin } from '@capacitor/core';

const MyRazorpay = registerPlugin('MyRazorpay', {
  web: () => ({
    pay: async () => {
      throw new Error('Razorpay native plugin not available on web.');
    },
  }),
});

export default MyRazorpay;
