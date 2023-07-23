import Router from "router";
import finalhandler from "finalhandler";
const getMenu = require("../services/getMenu");
const createMenuItem = require("../services/createMenuItem");
import { createProvider } from "../services/createProvider";
import { deleteMenuItems } from "../services/deleteMenuItems";
import { deleteProvider } from "../services/deleteProvider";
import { getFeedback } from "../services/getFeedback";
import { getMenuItems } from "../services/getMenuItems";
import { getProviderDetails } from "../services/getProviderDetails";
import { getProviders } from "../services/getProviders";
import { updateMenuItems } from "../services/updateMenuItems";
import { updateProvider } from "../services/updateProvider";

const router = Router();

router.get("/api/get-menu", getMenu);
router.get("/api/create-menu-item", createMenuItem);

function getRoutes(req, res) {
  router(req, res, finalhandler(req, res));
}

export default getRoutes;
