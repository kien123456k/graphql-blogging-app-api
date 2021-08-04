const Comment = {
  author(parent, _, { prisma }, _1) {
    return prisma.user.findUnique({
      where: {
        id: parent.authorId,
      },
    });
  },
  post(parent, _, { prisma }, _1) {
    return prisma.post.findUnique({
      where: {
        id: parent.postId,
      },
    });
  },
};

export default Comment;
