export * from "../middlewares/authMiddleware.js";
import { authenticate, authMiddleware } from "../middlewares/authMiddleware.js";
export { authMiddleware };
export default authenticate;
