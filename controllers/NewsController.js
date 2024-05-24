import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { newsSchema } from "../Validations/newsValidation.js";
import { imageValidator } from "../utils/helper.js";
import { generateRandomNum } from "../utils/helper.js";
import NewsAPITransform from "../transform/newsAPITransform.js";


class NewsController {
    static async index(req, res) {
        const news = await prisma.news.findMany({
            include:{
                user:{
                    id:true,
                    name:true,
                    profile:true,
                }
            }
        })
        const newsTransform = news?.map((item) => NewsAPITransform.transform(item));

        return res.json({status:200,news:newsTransform})
    }
    static async store(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            console.log(newsSchema)
            const validator = vine.compile(newsSchema)
            const payload = await validator.validate(body)
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    errors: {
                        image: "Image Is Required.",
                    },
                });
            }

            const image = req.files?.image
            const message = imageValidator(image?.size, image?.mimetype);
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        image: message,
                    },
                });
            }
            const imgExt = image?.name.split(".");
            const imageName = generateRandomNum() + "." + imgExt[1];
            const uploadPath = process.cwd() + "/public/images/" + imageName;

            image.mv(uploadPath, (err) => {
                if (err) throw err;
            });
            payload.image = imageName;
            payload.userId = user.id;
            const news = await prisma.news.create({
             data: payload,
                });
             
       

            return res.json({status:200,message:"News Created Succesfully",news});
        }

        catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({ status: 500, message: "Something Went Wrong" });
            }
        }
    }
    static async show(req, res) { }
    static async update(req, res) { }
    static async Destroy(req, res) { }
}
export default NewsController;