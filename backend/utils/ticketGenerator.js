// utils/ticketGenerator.js
exports.generateTicketNumber = () => {
    const prefix = 'TCK';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomNum}`;
  };
  