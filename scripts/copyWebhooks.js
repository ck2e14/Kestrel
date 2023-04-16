"use strict";

// list webhooks, clone but point at listener (instead of cimar/localhost:8080)
// WARN check where pointed, currently CKHOSP

import axios from "axios";
import { appendFileSync } from "fs";

let vars = {
   session: "28bbeba4-1639-4030-bb2c-f0c1fb2042c3",
   hlh: "bbf400f0-de54-4f15-ad2c-a973531517d1",
   ck: "00e9627a-92eb-4f56-a0bc-a75339c76bb5",
   ckUser: "fb307c5f-be53-4260-8d13-2a50effa5db9",
   cloneSpace: "2e7e04a9-6c4d-48a7-914d-5036e092a56e",
};

let { session, hlh, ck, ckUser, cloneSpace } = vars;

const api = axios.create({
   baseURL: "https://cloud.cimar.co.uk/api/v3/",
   headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-from-ck": new Date().toISOString(),
   },
});

await cloneEdit(await get());

async function get() {
   let {
      data: { webhooks },
   } = await api.post("webhook/list", {
      sid: session,
      account_id: ck,
   });
   console.log(`Got ${webhooks.length} webhooks`);
   return webhooks;
}

async function cloneEdit(webhooks) {
   let uniqueEndpoints = new Set();

   for (let webhook of webhooks) {
      let endpoint =
         webhook.url.match(/(?<=http:\/\/localhost\:8020\/).*/i)?.[0] || null;

      if (!endpoint || !endpoint.length) {
         console.log(`ERROR in regex match: Webhook ${webhook.uuid}`);
         continue;
      } else {
         uniqueEndpoints.add(endpoint);
      }

      let clone = { ...webhook };

      clone.name = `[CLONED] ${webhook.name}`;
      clone.url = `http://86.156.55.194:5984/${endpoint}`;
      clone.sid_user_id = ckUser;
      clone.method = "POST_JSON";

      await api.post("webhook/add", {
         sid: session,
         account_id: ck,
         ...clone,
      });
   }

   appendFileSync(
      "./data/uniqueEndpoints.csv",
      [...uniqueEndpoints].join("\n")
   );
}

// ----- delete [CLONED] webhooks from an account
// __delete();
async function __delete() {
   let {
      data: { webhooks },
   } = await api.post("webhook/list", {
      sid: session,
      account_id: ck,
      "filter.name.like": "[CLONED]%",
   });

   for (let { uuid } of webhooks) {
      api.post("webhook/delete", {
         sid: session,
         uuid: uuid,
      }).then(({ status }) => console.log(status));
   }
}
