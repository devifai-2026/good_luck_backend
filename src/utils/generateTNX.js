export const generateTransactionId = () => {
  // You can use any unique ID generation strategy, e.g., UUID
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
