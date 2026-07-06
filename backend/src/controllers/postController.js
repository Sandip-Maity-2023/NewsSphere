import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { getCollection, memoryPosts } from "../config/db.js";

const toPublicPost = (post) => {
  if (!post) return null;
  return {
    id: post._id?.toString() || post.id || "",
    title: post.title || "",
    content: post.content || "",
    mediaType: post.mediaType || "text",
    mediaUrl: post.mediaUrl || "",
    mediaName: post.mediaName || "",
    authorId: post.authorId || "",
    authorName: post.authorName || "Anonymous",
    authorEmail: post.authorEmail || "",
    likes: Number(post.likes || 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || post.createdAt || new Date().toISOString(),
  };
};

export const getPosts = async (_req, res) => {
  try {
    const collection = await getCollection();
    if (!collection) {
      const sortedMemory = [...memoryPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sortedMemory.map(toPublicPost));
    }
    const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(posts.map(toPublicPost));
  } catch (error) {
    res.status(500).json({ error: "Unable to load posts." });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, mediaType = "text", mediaUrl = "", mediaName = "", authorId = "", authorName = "Anonymous", authorEmail = "" } = req.body || {};
    const trimmedTitle = String(title || "").trim();
    const trimmedContent = String(content || "").trim();

    if (!trimmedTitle && !trimmedContent && !mediaUrl) {
      return res.status(400).json({ error: "Add text, image, or video before posting." });
    }

    const createdAt = new Date().toISOString();
    const postDocument = {
      title: trimmedTitle,
      content: trimmedContent,
      mediaType,
      mediaUrl,
      mediaName,
      authorId,
      authorName,
      authorEmail,
      likes: 0,
      comments: [],
      createdAt,
      updatedAt: createdAt,
    };

    const collection = await getCollection();
    if (!collection) {
      const savedMemoryPost = { ...postDocument, _id: randomUUID() };
      memoryPosts.unshift(savedMemoryPost);
      return res.status(201).json(toPublicPost(savedMemoryPost));
    }

    const result = await collection.insertOne(postDocument);
    res.status(201).json(toPublicPost({ ...postDocument, _id: result.insertedId }));
  } catch (error) {
    res.status(500).json({ error: "Unable to create post." });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection();

    if (!collection) {
      const post = memoryPosts.find(p => p._id === id || p.id === id);
      if (!post) return res.status(404).json({ error: "Post not found." });
      post.likes = (post.likes || 0) + 1;
      post.updatedAt = new Date().toISOString();
      return res.json(toPublicPost(post));
    }

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post ID structure." });
    
    const objId = new ObjectId(id);
    const updated = await collection.findOneAndUpdate(
      { _id: objId },
      { $inc: { likes: 1 }, $set: { updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!updated) return res.status(404).json({ error: "Post not found." });
    res.json(toPublicPost(updated));
  } catch (error) {
    res.status(500).json({ error: "Unable to process like." });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name = "Anonymous", text = "" } = req.body || {};
    const commentText = String(text).trim();

    if (!commentText) return res.status(400).json({ error: "Comment text cannot be empty." });

    const newComment = {
      id: randomUUID(),
      name: String(name).trim() || "Anonymous",
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    const collection = await getCollection();
    if (!collection) {
      const post = memoryPosts.find(p => p._id === id || p.id === id);
      if (!post) return res.status(404).json({ error: "Post not found." });
      post.comments = [...(post.comments || []), newComment];
      post.updatedAt = new Date().toISOString();
      return res.json(toPublicPost(post));
    }

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post ID." });

    const updated = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $push: { comments: newComment }, 
        $set: { updatedAt: new Date().toISOString() } 
      },
      { returnDocument: "after" }
    );

    if (!updated) return res.status(404).json({ error: "Post not found." });
    res.json(toPublicPost(updated));
  } catch (error) {
    res.status(500).json({ error: "Unable to add comment." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.body?.authorId || req.query?.authorId || "";
    const collection = await getCollection();

    if (!collection) {
      const index = memoryPosts.findIndex(p => p._id === id || p.id === id);
      if (index === -1) return res.status(404).json({ error: "Post not found." });
      if (memoryPosts[index].authorId && memoryPosts[index].authorId !== actorId) {
        return res.status(403).json({ error: "Forbidden: You are not the author." });
      }
      memoryPosts.splice(index, 1);
      return res.json({ message: "Post deleted successfully." });
    }

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post ID format." });
    const objId = new ObjectId(id);

    const post = await collection.findOne({ _id: objId });
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (post.authorId && post.authorId !== actorId) {
      return res.status(403).json({ error: "Forbidden: You are not authorized to delete this post." });
    }

    await collection.deleteOne({ _id: objId });
    res.json({ message: "Post deleted." });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete post." });
  }
};