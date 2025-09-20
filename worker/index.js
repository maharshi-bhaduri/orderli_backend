import { createClient } from "@supabase/supabase-js";

function getSupabase(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
async function queryD1(env, sqlQuery, params = []) {
  const response = await fetch(env.D1_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.D1_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: sqlQuery,
      params,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Error querying D1: ${JSON.stringify(data.errors || data)}`
    );
  }
  return data;
}
async function syncOrders(env) {
  console.log("Running  sync job...");
  const supabase = getSupabase(env);
  // 1. Fetch rows from Supabase
  const { data: rows, error } = await supabase
    .from("order_items_live")
    .select()
    .eq("complete", 1);

  if (error) {
    console.error("Supabase fetch failed:", error.message);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log("No completed orders to sync.");
    return;
  }

  const sqlQuery = `
      INSERT  INTO orders
      (orderItemId, createdAt, updatedAt, partnerId, menuId, itemName, quantity, itemPrice, itemStatus, tableId, orderId, complete)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const insertedIds = [];
  // 2. Insert rows into D1, track successes
  try {
    for (const row of rows) {
      await queryD1(env, sqlQuery, [
        row.orderItemId,
        row.createdAt,
        row.updatedAt,
        row.partnerId,
        row.menuId,
        row.itemName,
        row.quantity,
        row.itemPrice,
        row.itemStatus,
        row.tableId,
        row.orderId,
        row.complete,
      ]);
      insertedIds.push(row.orderItemId);
    }
    console.log(`Copied ${rows.length} rows to D1.`);
    // 3. Delete only successfully inserted rows

    if (insertedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("order_items_live")
        .delete()
        .in("orderItemId", insertedIds);

      if (deleteError) {
        console.error(
          "Failed to delete records from supabase",
          deleteError.message
        );
      } else {
        console.log(`Deleted ${insertedIds.length} records from supabase`);
      }
    }
  } catch (err) {
    console.error("Error inserting rows into D1:", err);
  }
  console.log(`Synced ${rows.length} rows.`);
}

export default {
  async scheduled(event, env, ctx) {
    await syncOrders(env);
  },

  async fetch(request, env, ctx) {
    //console.log(env);
    const url = new URL(request.url);
    if (url.pathname === "/sync-now") {
      const result = await syncOrders(env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Worker is running", { status: 200 });
  },
};
