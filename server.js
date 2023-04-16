"use strict";

import express from "express";
import axios from "axios";
import { appendFileSync } from "fs";

const app = express();

app.use(express.json());

const api = axios.create({
   baseURL: "https://cloud.cimar.co.uk/api/v3/",
   headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-from-ck": new Date().toISOString() + "--kestrel",
   },
});

let session = "28bbeba4-1639-4030-bb2c-f0c1fb2042c3";

process.env.PORT = process.env.PORT || 5984;

app.listen(process.env.PORT, () => {
   console.log(`Server started on port ${process.env.PORT}`);
});

app.post("/study/viewed", async (req, res) => {
   let { userID, uuid, acc, phi_namespace_name, site, workstream } =
      req.body;
      console.log(req.body)

   let { data: userData } = await api.post("user/get", {
      sid: session,
      uuid: userID,
   });

   let esc = val => val?.replaceAll(",", "-") || val; // lazy but easy-mode avoids fucked delimiting

   let event = {
      user: {
         id: userID || "unknown",
         name: esc(userData.name) || "unknown",
         email: esc(userData.email) || "unknown",
      },
      study: {
         site: esc(site) || "unknown",
         uuid: uuid || "unknown",
         accession: esc(acc) || "unknown",
         workstream: esc(workstream) || "unknown",
         phi_namespace_name: esc(phi_namespace_name) || "unknown",
      },
      when: new Date().toISOString(), // TODO take from request header - should be time of event not time received but negligibly matters in reality
   };

   let csvRow =
      `${event?.user?.id},` +
      `${event?.user?.name},` +
      `${event?.user?.email},` +
      `${event?.study?.uuid},` +
      `${event?.study?.accession},` +
      `${event?.when},` +
      `${event?.study?.phi_namespace_name},` +
      `${event?.study?.site},` +
      `${event?.study?.workstream}`;

   console.log(event);

   appendFileSync(`./events/HLH/studyViewEvents.csv`, csvRow + "\n");

   res.send("OK - logged");
});

app.post("/study/push/hl7", (req, res, next) => {
   console.log(req.body);
});

app.post("/study/set", (req, res, next) => {
   console.log(req.body);
});

app.post("/study/share", (req, res, next) => {
   console.log(req.body);
});

app.post("/study/share/stop", (req, res, next) => {
   console.log(req.body);
});

app.post("/study/status/set", (req, res, next) => {
   console.log(req.body);
});

app.post("/study/sync", (req, res, next) => {
   console.log(req.body);
});

app.post("/webhook/email", (req, res, next) => {
   console.log(req.body);
});

app.post("/destination/search", (req, res, next) => {
   console.log(req.body);
});
