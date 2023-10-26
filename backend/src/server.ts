import express from "express";
import "dotenv/config";
import "./db";
import { PORT } from "@/utils/variables";

const app = express();

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
