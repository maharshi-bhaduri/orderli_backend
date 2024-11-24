import { allowCors, resUtil, verifyAuth } from "../utils/utils";
import supabaseClient from "../utils/supabaseClient";

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      resUtil(res, 405, "Method not allowed");
      return;
    }

    const { orderId, newStatus } = req.body;
    console.log("orderitemid", orderId);
    console.log("itemstatus", newStatus);
    if (!orderId || newStatus === undefined) {
      resUtil(res, 400, "Missing required fields: orderItemId or itemStatus");
    }
    const { data, error } = await supabaseClient
      .from("order_items_live")
      .update({ itemStatus: newStatus })
      .eq("orderItemId", orderId);

    if (error) {
      console.error("Supabase update error:", error.message);
      resUtil(res, 500, `Database error: ${error.message}`);
    }
    resUtil(res, 200, "Order status updated successfully", data);
  } catch (error) {
    console.log("Error processing request:", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(verifyAuth(handler));
