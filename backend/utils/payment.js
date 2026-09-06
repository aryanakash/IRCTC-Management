// Mock Payment Processing Function
exports.processPaymentMock = (amount) => {
  console.log(`💳 Processing mock payment of ₹${amount}...`);

  // Simulate a 90% success rate for payments
  const success = Math.random() < 0.9;

  if (success) {
    console.log(`✅ Payment successful. Amount Paid: ₹${amount}`);
    return true;
  } else {
    console.log('❌ Payment failed.');
    return false;
  }
};

// Mock Refund Processing Function
exports.processRefundMock = (amount) => {
  console.log(`🔄 Processing mock refund of ₹${amount}...`);

  // Simulate a 90% success rate for refunds
  const success = Math.random() < 0.9;

  if (success) {
    console.log(`✅ Refund processed successfully. Amount Refunded: ₹${amount}`);
    return true;
  } else {
    console.log('❌ Refund failed.');
    return false;
  }
};
