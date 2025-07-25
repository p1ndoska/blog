const prisma = require("../prisma/prisma-client");
const PostController = {
    addPost: async(req, res) => {
        const {content} = req.body;

        const authorId = req.user.userId;
        if(!content){
            return res.status(401).json({error:'Контент обязателен'})
        }

        try{
            const post = await prisma.post.create({
                data:{
                    content,
                    authorId
                }
            })

            res.json({post})
        }catch(err){
            console.error('addPost error', err);
            res.status(500).json({error:"internal server error"});
        }
    },
    getPosts: async(req, res) => {
        const userId = req.user.userId;

        try{
            const posts = await prisma.post.findMany({
                include:{
                    likes: true,
                    comments: true,
                    author: true
                },
                orderBy:{
                    createdAt: 'desc'
                }
            })

            const likedPosts = posts.map((post) =>( {
                ...post,
                    likedByUser: post.likes.some(like=>{like.userId === userId})
            }))

            res.json({likedPosts})
        }catch(err){
            console.error('getPosts error', err);
            res.status(500).json({error:"internal server error"});
        }
    },
    getPostById: async(req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;

        try{
            const post = await prisma.post.findUnique({
                where: {
                    id: id
                },
                include:{
                    comments:{
                        include:{
                            user: true
                        }
                    },
                    likes:true,
                    author:true
                }
            })

            if(!post){
                return res.status(404).json({error:"Пост не найден"});
            }

            const likedPost =  {
                ...post,
                likedByUser: post.likes.some(like=>{like.userId === userId})
            }

            res.json({likedPost})
        }  catch(err){
            console.error('getPostById error', err);
            res.status(500).json({error:"internal server error"});
        }
    },
    updatePost: async(req, res) => {
        const {id} = req.params;

        const {content} = req.body;

        const post = await prisma.post.findUnique({
            where: {id}
        });

        if (post.authorId !== req.user.userId) {
            return res.status(403).json({ error: "Нет доступа" });
        }

        if(!content){
             return res.status(400).json({error:"Поле обязательно"});
        }

        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        try{
            const post = await prisma.post.update({
                where: {id},
                data: {
                    content: content||undefined,
                }
            })
            res.json({post})
        }catch(err){
            console.error('updatePost error', err);
            res.status(500).json({error:"internal server error"});
        }
    },
    deletePost: async(req, res) => {

        const {id} = req.params;

        const post = await prisma.post.findUnique({
            where: {id}
        });
        if(!post){
            return res.status(404).json({error:"Пост не найден"});
        }

        if(post.authorId !== req.user.userId){
            return res.status(403).json({error:"Нет доступа"});
        }

        try{
           const transaction = await prisma.$transaction(
               [
                    prisma.comment.deleteMany({
                        where: {postId: id},
                    }),
                   prisma.like.deleteMany({
                       where: {postId: id},
                   }),
                   prisma.post.delete({
                       where: {id},
                   })
               ]
           )

            res.json(transaction);

        }catch(err){
            console.error('deletePostError', err);
            res.status(500).json({error:"internal server error"});
        }
    },
}
module.exports = PostController;