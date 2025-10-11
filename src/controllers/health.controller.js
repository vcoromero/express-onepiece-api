const getHealth = (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'One Piece API is running',
    timestamp: new Date().toISOString()
  };

  res.status(200).json(healthStatus);
};

module.exports = {
  getHealth
};

