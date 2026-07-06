import {MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URL=process.env.MONGODB_URI || "";
const DB=process.env.MONGODB_DB || "";

let mongoClient=null;
let postsCollection=null;
let conn=false;


export const getCollection =async()=> {
    if(postsCollection) return postsCollection;
    if(!URL) return null;

    if(!mongoClient && !conn){
        conn=true;
        try {
            mongoClient=await MongoClient.connect(URL,{
                maxPoolSize:10,
                serverSelectionTimeoutMS:5000,
            });

            await mongoClient.db(DB).command({ping:1});
            postsCollection=mongoClient.db(DB).collection("posts");

            await postsCollection.createIndex({createdAt:-1});
            await postsCollection.createIndex({authorId:-1});
            console.log(`Connected to MongoDB database "${MONGODB_DB}"`);
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error}`);
            mongoClient=null;
            postsCollection=null;
        }finally{
            conn=false;
        }
    }
    return postsCollection;
}

export const memoryPosts=[];
export const userPreferences={};
      
