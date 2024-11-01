import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getAllContacts,
  getContactsForDMList,
  searchContacts,
} from "../controllers/ContactsController.js";

const contactcRoutes = Router();

contactcRoutes.post("/search", verifyToken, searchContacts);
contactcRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);
contactcRoutes.get("/get-all-contacts", verifyToken, getAllContacts);
export default contactcRoutes;
