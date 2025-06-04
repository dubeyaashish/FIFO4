const authorizeRole = (allowedRoles) => (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }
  
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secretKey);
  
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      req.user = decoded; // Attach user info to the request object
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
  