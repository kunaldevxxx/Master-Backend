import prisma from "../DB/db.config.js";
import vine from "@vinejs/vine";
import { errors } from "@vinejs/vine";
import bcrypt from "bcryptjs";
import { messages } from "@vinejs/vine/defaults";
import { registerSchema } from "../Validations/AuthValidation.js";
class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);
            //check if email exist 
            const findUser=  await prisma.users.findUnique({
                where:{
                    email:payload.email
                }
            })
            if(findUser){
                return res.status(400).json({errors:{
                    email:"Email Already In Use",
                }})
            }
            // Encrypt the Password 
            const salt=bcrypt.genSaltSync(10)
            payload.password=bcrypt.hashSync(payload.password,salt)
            const user=await prisma.users.create({
                data:payload
            })
            return res.json({status:200,message:"User Created Succesfully",user});
        }
        catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages)
                return res.status(400).json({errors: error.messages})
            }
            else{
                return res.status(500).json({status:500,message:"Something Went Wrong"})
            }
        }
    }
}
export default AuthController