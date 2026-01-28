const { getRedisClient } = require('../config/redis');

class RedisService {
  constructor() {
    this.client = null;
    this.RESERVATION_PREFIX = 'reservation:';
    this.STOCK_LOCK_PREFIX = 'stock_lock:';
    this.USER_CART_PREFIX = 'user_cart:';
  }

  initialize() {
    this.client = getRedisClient();
  }

  // Generate keys
  getReservationKey(userId) {
    return `${this.RESERVATION_PREFIX}${userId}`;
  }

  getStockLockKey(productId) {
    return `${this.STOCK_LOCK_PREFIX}${productId}`;
  }

  getUserCartKey(userId) {
    return `${this.USER_CART_PREFIX}${userId}`;
  }

  // Lock product stock for reservation
  async lockStock(productId, quantity, ttlSeconds = 600) {
    const key = this.getStockLockKey(productId);
    const currentLock = await this.client.get(key);
    const currentQuantity = currentLock ? parseInt(currentLock) : 0;
    const newQuantity = currentQuantity + quantity;
    
    await this.client.set(key, newQuantity.toString(), {
      EX: ttlSeconds,
      KEEPTTL: currentLock ? true : false,
    });
    
    return newQuantity;
  }

  // Release locked stock
  async releaseStock(productId, quantity) {
    const key = this.getStockLockKey(productId);
    const currentLock = await this.client.get(key);
    
    if (!currentLock) {
      return 0;
    }
    
    const currentQuantity = parseInt(currentLock);
    const newQuantity = Math.max(0, currentQuantity - quantity);
    
    if (newQuantity === 0) {
      await this.client.del(key);
    } else {
      await this.client.set(key, newQuantity.toString(), {
        KEEPTTL: true,
      });
    }
    
    return newQuantity;
  }

  // Get current locked stock for a product
  async getLockedStock(productId) {
    const key = this.getStockLockKey(productId);
    const locked = await this.client.get(key);
    return locked ? parseInt(locked) : 0;
  }

  // Store user's cart/reservation with TTL
  async setUserReservation(userId, reservationData, ttlSeconds = 600) {
    const key = this.getReservationKey(userId);
    await this.client.set(key, JSON.stringify(reservationData), {
      EX: ttlSeconds,
    });
  }

  // Get user's reservation
  async getUserReservation(userId) {
    const key = this.getReservationKey(userId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Delete user's reservation
  async deleteUserReservation(userId) {
    const key = this.getReservationKey(userId);
    await this.client.del(key);
  }

  // Check if user has an active reservation
  async hasActiveReservation(userId) {
    const key = this.getReservationKey(userId);
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Get TTL for user's reservation
  async getReservationTTL(userId) {
    const key = this.getReservationKey(userId);
    return await this.client.ttl(key);
  }

  // Atomic check and reserve operation using Lua script
  async atomicReserveStock(productId, quantity, ttlSeconds = 600) {
    const key = this.getStockLockKey(productId);
    
    // Lua script for atomic operation
    const script = `
      local key = KEYS[1]
      local quantity = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])
      
      local current = redis.call('GET', key)
      local currentQty = current and tonumber(current) or 0
      local newQty = currentQty + quantity
      
      redis.call('SET', key, tostring(newQty), 'EX', ttl)
      return newQty
    `;
    
    return await this.client.eval(script, {
      keys: [key],
      arguments: [quantity.toString(), ttlSeconds.toString()],
    });
  }

  // Get all reservation keys (for cleanup)
  async getAllReservationKeys() {
    return await this.client.keys(`${this.RESERVATION_PREFIX}*`);
  }

  // Get all stock lock keys (for cleanup)
  async getAllStockLockKeys() {
    return await this.client.keys(`${this.STOCK_LOCK_PREFIX}*`);
  }
}

module.exports = new RedisService();
