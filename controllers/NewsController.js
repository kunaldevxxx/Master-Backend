import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { newsSchema } from "../Validations/newsValidation.js";
import { validator } from "@vinejs/vine/factories";

class NewsController {
    static async index(req,res) {}
    static async store(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            console.log(newsSchema)
            const validator=vine.compile(newsSchema)
            const payload = await validator.validate(body)
            return res.status(200)
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({ status: 500, message: "Something Went Wrong" });
            }
        }
    }
    static async show(req, res) {}
    static async update(req, res) {}
    static async Destroy(req, res) {}
}
export default NewsController;