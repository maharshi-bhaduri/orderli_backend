import Router from "router";
import finalhandler from "finalhandler";
import { allowCors } from "../utils/utils";
const getMenu = require("../services/getMenu");
const createMenuItem = require("../services/createMenuItem");
const createProvider = require("../services/createProvider");
const deleteMenuItems = require("../services/deleteMenuItems");
const deleteProvider = require("../services/deleteProvider");
const getFeedback = require("../services/getFeedback");
const getMenuItems = require("../services/getMenuItems");
const getProviderDetails = require("../services/getProviderDetails");
const getProviders = require("../services/getProviders");
const updateMenuItems = require("../services/updateMenuItems");
const updateProvider = require("../services/updateProvider");
const updateMenu = require("../services/updateMenu");
const service2 = require("../services/service2");
const service3 = require("../services/service3");
const service4 = require("../services/service4");


const router = Router();

router.post("/api/create-provider", createProvider);
router.post("/api/create-menu-item", createMenuItem);
router.get("/api/get-provider-details", getProviderDetails);
router.get("/api/get-providers", getProviders);
router.get("/api/get-menu-items", getMenuItems);
router.get("/api/get-menu", getMenu);
router.post("/api/delete-provider", deleteProvider);
router.post("/api/delete-menu-items", deleteMenuItems);
router.post("/api/update-provider", updateProvider);
router.post("/api/update-menu-items", updateMenuItems);
router.post("/api/update-menu", updateMenu);
router.get("/api/get-feedback", getFeedback);
router.get("/api/update-menu", updateMenu);
router.get("/api/service-2", service2);
router.get("/api/service-3", service3);
router.get("/api/service-4", service4);

function getRoutes(req, res) {
  router(req, res, finalhandler(req, res));
}

export default allowCors(getRoutes);
