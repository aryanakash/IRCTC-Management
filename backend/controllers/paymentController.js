exports.processPayment = async (req, res) => {
    const { userId, amount } = req.body;
  
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    const paymentId = 'FAKE-' + Math.floor(Math.random() * 1000000);
  
    res.status(200).json({
      message: 'Payment successful!',
      paymentId,
      amount,
    });
  };
  