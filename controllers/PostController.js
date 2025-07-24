const PostController = {
    addPost: async(req, res) => {
res.send('addPost');
    },
    getPosts: async(req, res) => {
        res.send('getPost');

    },
    getPostById: async(req, res) => {
        res.send('getidPost');

    },
    updatePost: async(req, res) => {
        res.send('updtPost');

    },
    deletePost: async(req, res) => {
        res.send('deletePost');

    },
}
module.exports = PostController;