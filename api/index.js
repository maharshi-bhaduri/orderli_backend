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
const getFeedbackConsumers = require("../services/getFeedbackConsumers");
const addFeedbackConsumers = require("../services/addFeedbackConsumers");
const getPartnerDetailsConsumer = require("../services/getPartnerDetailsConsumer");
const addTable = require("../services/addTable");
const getTables = require("../services/getTables");
const updateTable = require("../services/updateTable");
const addOrder = require("../services/addOrder");
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
router.get("/api/get-feedback-consumers", getFeedbackConsumers);
router.post("/api/add-feedback-consumers", addFeedbackConsumers);
router.get("/api/get-partner-details-consumer", getPartnerDetailsConsumer);
router.post("/api/add-table", addTable);
router.get("/api/get-tables", getTables);
router.post("/api/update-table", updateTable);
router.post("/api/add-order", addOrder);

function getRoutes(req, res) {
  router(req, res, finalhandler(req, res));
}

export default allowCors(getRoutes);
