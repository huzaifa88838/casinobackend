// routes/user.routes.js
import { Router } from "express";
import { loginUser, registerUser, logoutUser, userStatus, getUserDetails, getAllusers ,forgotPassword, resetPassword ,changePassword, getAllMasters, getAllagents, deleteUser, updateUser, transferFunds,getMasterById} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/status").get(verifyJWT, userStatus);
router.route("/getuser/:userId").get(verifyJWT, getUserDetails); // Correct route for fetching user details
// router.route("/getalluser").get( getAllUsers);
router.route("/master").get(getAllMasters)
router.route("/agent").get(getAllagents)
router.route("/user").get(getAllusers)
router.route("/masterone/:id").get(getMasterById)

router.route("/deleteuser/:id").delete(deleteUser)
router.route("/updateuser/:id").put(updateUser)
router.route("/deposit").post(transferFunds)





router.route("/updatepassword").put(verifyJWT,changePassword)


// Get order(s) for a specific user

   // Correct route for fetching order details

   
router.post("/forgot-password",forgotPassword)
router.post("/reset-password", resetPassword);


export default router;
