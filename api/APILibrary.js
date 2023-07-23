import Router from "router";
import finalhandler from "finalhandler";
import { createMenuItem } from "../services/createMenuItem";
import { createProvider } from "../services/createProvider";
import { deleteMenuItems } from "../services/deleteMenuItems";
import { deleteProvider } from "../services/deleteProvider";
import { getFeedback } from "../services/getFeedback";
import { getMenu } from "../services/getMenu";
import { getMenuItems } from "../services/getMenuItems";
import { getProviderDetails } from "../services/getProviderDetails";
import { getProviders } from "../services/getProviders";
import { updateMenuItems } from "../services/updateMenuItems";
import { updateProvider } from "../services/updateProvider";

const router = Router();

router.get("/api/root/get-menu", getMenu);

function getRoutes(req, res) {
  console.log("hi");
  router(req, res, finalhandler(req, res));
}

export default getRoutes;
