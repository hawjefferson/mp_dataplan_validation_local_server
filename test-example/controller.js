/**
 * This is a boiled down version of what a route handler might look like
 * including a tracking call to mParticle
 */
module.exports.couponUsedHandler = async (couponData={}, mpClient) => {    
    // track event to mParticle
    await mpClient.track(couponData);
}