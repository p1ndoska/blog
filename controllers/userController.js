const prisma = require ('../prisma/prisma-client')
const bcrypt = require ('bcryptjs')
const jdenticon = require("jdenticon");
const fs = require('fs');
const path = require("path");
const jwt = require("jsonwebtoken");


const UserController = {
    register: async (req, res) =>{
        const {  email, password, name} = req.body;

        if(!email || !password || !name){
            return res.status(400).json({error: "все поля обязательные"})
        }

        try{
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if(existingUser){
                return res.status(400).json({error:"пользователь уже существует"})
            }

            const hashedPassword= await bcrypt.hash(password, 10);

            const png = jdenticon.toPng(name, 200);
            const avatarName = `${name}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            const user = await prisma.user.create({
                data:{
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarName}`                }
            })

            res.json({user});
            console.log({user});

        }catch (error){
            console.error('register error', error);
            res.status(500).json({error: 'internal server error'});
        }

    },
    login:async (req, res) =>{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(404).json({error: "Введите данные"})
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            })

            if(!user){
                res.status(400).json({error: "Неверные данные"})
            }

            const valid = await bcrypt.compare(password, user.password);

            if(!valid){
                res.status(400).json({error: 'Неверные данные'})
            }

            const token = jwt.sign({
                userId: user.id,
            }, process.env.SECRET_KEY)

            res.json({token});

        }catch (error){
            console.error('login error', error);
            res.status(500).json({error: 'internal server error'});
        }
    },
    getUserById: async(req, res)=>{
        const {id} = req.params;
        const UserId = req.user.userId;


        try{

            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    followers: true,
                    following: true,
                }
            });

            if(!user){
                return res.status(400).json({error:"Пользователь не найден"})
            }

            const isFollowing = await prisma.Follows.findFirst({
                where:{
                    AND:[
                        {followerId: UserId},
                        {followingId: id}

                    ]
                }
            })
            res.json({...user, isFollowing: Boolean(isFollowing)});

        }catch (error){
            console.error('userId error', error);
            res.status(500).json({error: 'internal server error'});
        }
    },
    current: async(req, res)=>{
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: req.user.userId
                },
                include: {
                    followers: {
                        include: {
                            follower: true
                        }
                    },
                    following: {
                        include: {
                            following: true
                        }
                    }
                }
            });
            if(!user){
                res.status(400).json({error:"Пользователь не найден"})
            }
            res.status(200).json({user});
        }catch (err){
            console.error('current error', err);
            res.status(500).json({error: 'internal server error'});
        }
    },
    updateUser: async(req, res)=>{
        const {id} = req.params;
        const {email, name, bio, location, dateOfBirth } = req.body;

        let filePath;

        if(req.file && req.filePath){
            filePath = req.file.path;
        }

        if(id !== req.user.userId){
            res.status(400).json({error: "Нет доступа"})
        }

        try{
            if(email){
                const existUser = await prisma.user.findFirst({
                    where: { email: email },
                })
                if(existUser && existUser.userId !==parseInt(id)){
                    res.status(400).json({error: "Такой пользователь уже существует"})
                }
            }

            const {user} = await prisma.user.update({
                where: {id},
            data: {
                    email:email||undefined,
                    name:name||undefined,
                    bio:bio||undefined,
                    location:location||undefined,
                    dateOfBirth:dateOfBirth||undefined,
                    avatarUrl: filePath? '/filePath': undefined,
                }
            })

            res.json({user});

        }catch(error){
            console.error('update error', error);
            res.status(500).json({error: 'internal server error'});
        }
    }
}

module.exports = UserController;