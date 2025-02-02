// routes/user.routes.js
import { Router } from "express";
import { loginUser, registerUser, logoutUser, userStatus, getUserDetails, getAllUsers ,forgotPassword, resetPassword, updateDeposit, getUserDeposit, createWithdrawalRequest, getAllWithdrawals ,changePassword,updateWithdrawPin} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/status").get(verifyJWT, userStatus);
router.route("/getuser/:userId").get(verifyJWT, getUserDetails); // Correct route for fetching user details
router.route("/getalluser").get( getAllUsers);
router.route("/updatedeposit").post(updateDeposit)
router.route("/userdeposit").get(verifyJWT,getUserDeposit)
router.route("/createwithdraw").post(verifyJWT,createWithdrawalRequest )
router.route("/allwithdrawls").get(getAllWithdrawals)
router.route("/updatepassword").put(verifyJWT,changePassword)
router.route("/update-withdraw-pin").put(verifyJWT,updateWithdrawPin)


// Get order(s) for a specific user

   // Correct route for fetching order details

   
router.post("/forgot-password",forgotPassword)
router.post("/reset-password", resetPassword);


export default router;
