import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { newsSchema } from "../Validations/newsValidation.js";
import { imageValidator, removeImage,uploadImage } from "../utils/helper.js";
import { generateRandomNum } from "../utils/helper.js";
import NewsAPITransform from "../transform/newsAPITransform.js";
import redisCache from "../DB/redis.config.js";
import { loggers } from "winston";


class NewsController {
    static async index(req, res) {
        const page=Number(req.query.page || 1)
        const limit=Number(req.query.limit || 1)

        if(page<=0){
            page=1
        }
        if(limit<=0 || limit>100){
            limit=10
        }
        const skip = (page-1)*limit 

        const news = await prisma.news.findMany({
            take:limit,
            skip:skip,
            include:{
                user:{
                    id:true,
                    name:true,
                    profile:true,
                }
            }
        })
        const newsTransform = news?.map((item) => NewsAPITransform.transform(item));
        const totalNews=await prisma.news.count()
        const totalPages=Math.ceil(totalNews/limit)

        return res.json({status:200,news:newsTransform,metadata:{
            totalPages,
            currentPage:page,
            currentLimit:limit,
        }})
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
            redisCache.del("/api/news",(err)=>{
                if (err) throw err;

            })

            return res.json({status:200,message:"News Created Succesfully",news});
        }

        catch (error) {
            loggers.error(error?.message);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({ status: 500, message: "Something Went Wrong" });
            }
        }
    }
    static async show(req, res) { 
        try{
            const {id}=req.params
            const news=await prisma.news.findUnique({
                where:{
                    id:Number(id)
                },
                include:{
                    user:{
                        select:{
                            id:true,
                            name:true,
                            profile:true
                        }
                    }
                }
            })
            const transformNews=news ? NewsAPITransform.transform(news) : null
            return res.json({status:200,news:transformNews});
        }
        catch(error){
            return res.status(500).json({message:"Something Went Wrong , pls try again !!!!"})
        }
      
    }
    static async update(req, res) { 
        const { id } = req.params 
        const user = req.user 
        const body = req.body 
        const news = await prisma.news.findUnique({
            where:{
                id:Number(id)
            }
        })
        if(user.id!==news.userId){
            return res.status(400).json({message:"Unauthorized"})
        }
        const validator = vine.compile(newsSchema)
        const payload = await validator.validate(body)
        const image=req?.files?.image 
        
        if(image){
            //*delete old image
            const message = imageValidator(image?.size , image?.mimetype)
            if(message!==null){
                return res.status(400).json({errors:{
                    image:message 
                }})
            }
            const imageName = uploadImage(image);
                  payload.image = imageName;
                 // * Delete old image
                removeImage(news.image);

        }
        await prisma.news.update({
            data: payload,
            where: {
              id: Number(id),
            },
          });
    
          return res.status(200).json({ message: "News updated successfully!" });
        } catch (error) {
          if (error instanceof errors.E_VALIDATION_ERROR) {
            // console.log(error.messages);
            return res.status(400).json({ errors: error.messages });
          } else {
            return res.status(500).json({
              status: 500,
              message: "Something went wrong.Please try again.",
            });
          }
        }
        static async destroy(req, res) {
            try {
              const { id } = req.params;
              const user = req.user;
              const news = await prisma.news.findUnique({
                where: {
                  id: Number(id),
                },
              });
              if (user.id !== news?.user_id) {
                return res.status(401).json({ message: "Un Authorized" });
              }
        
              // * Delete image from filesystem
              removeImage(news.image);
              await prisma.news.delete({
                where: {
                  id: Number(id),
                },
              });
              return res.json({ message: "News deleted successfully!" });
            } catch (error) {
              return res.status(500).json({
                status: 500,
                message: "Something went wrong.Please try again.",
              });
            }
          }
}
export default NewsController;