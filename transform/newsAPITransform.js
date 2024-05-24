import { getImageUrl } from "../utils/helper.js";

class NewsAPITransform{
    static transform(news){
        return {
        id:news.id,
        heading:news.title,
        content:news.content,
        image:getImageUrl(news.image)
        }
    }
}
export default NewsAPITransform;