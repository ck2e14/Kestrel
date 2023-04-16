"use strict";

/*
   For each endpoint in 'targets' array, list and cache everything to:
   ./data/backup/ACCOUNT_NAME/DATE/TARGET
*/

import axios from "axios";
import { writeFileSync, existsSync, mkdirSync } from "fs";

const api = axios.create({
   baseURL: "https://cloud.cimar.co.uk/api/v3/",
   headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-from-ck": new Date().toISOString(),
   },
});

let accountID = "bbf400f0-de54-4f15-ad2c-a973531517d1";
let accountName = "HLH";
let session = "28bbeba4-1639-4030-bb2c-f0c1fb2042c3";
let targets = [
   "destination",
   "route",
   "webhook",
   "dictionary",
   "customfield",
   "group",
   "location",
];

for (let target of targets) {
   let today = new Date().toISOString().split("T")[0];

   if (!existsSync(`./data/backup/${accountName}/${today}`)) {
      mkdirSync(`./data/backup/${accountName}/${today}`, { recursive: true });
   }

   let writePath = `./data/backup/HLH/${today}/${target.replaceAll(
      "/",
      "-"
   )}-list.json`;

   let responseField = target + "s"; // e.g. customfields

   if (target === "dictionary") {
      responseField = "dictionaries"; // because spelling
   }

   let { data } = await api.post(target + "/list", {
      sid: session,
      account_id: accountID,
   });

   writeFileSync(writePath, JSON.stringify(data[responseField]));
}
