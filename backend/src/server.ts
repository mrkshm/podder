import express from "express";
import "dotenv/config";
import "./db";
import { PORT } from "@/utils/variables";
import authRouter from './routers/auth';
import audioRouter from './routers/audio';
import favoriteRouter from './routers/favorite';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
