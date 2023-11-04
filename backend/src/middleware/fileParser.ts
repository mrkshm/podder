import { Request, RequestHandler } from "express";
import formidable from "formidable";

export interface RequestWithFiles extends Request {
  files?: { [key: string]: formidable.File | formidable.File[] };
}

const fileParser: RequestHandler = async (req: RequestWithFiles, res, next) => {
  if (!req.headers["content-type"]?.includes("multipart/form-data;")) {
    return res.status(422).json({ error: "Only accepts form-data!" });
  }

  const form = formidable({ multiples: false });

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields, files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    console.log("Parsed files:", files);


    // Flatten the fields to single values if they are arrays
    for (const key in fields) {
      const fieldValue = fields[key];
      if (typeof fieldValue === "object" && fieldValue !== null && Array.isArray(fieldValue)) {
          req.body[key] = fieldValue[0];
      } else if (typeof fieldValue === "string") {
          req.body[key] = fieldValue;
      }
  }
  

    // If there are files to process
    if (files) {
      if (!req.files) {
          req.files = {};
      }
  
      for (const key in files) {
          const fileValue = files[key];
          if (Array.isArray(fileValue)) {
              req.files[key] = fileValue[0] as formidable.File;
          } else if (fileValue && typeof fileValue === "object") {
              req.files[key] = fileValue as formidable.File;
          }
      }
  }

    console.log("-----> req.body", req.body);
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export default fileParser;
