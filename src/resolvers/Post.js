const Post = {
  author(parent, _, { prisma }, _1) {
    return prisma.user.findUnique({
      where: {
        id: parent.authorId,
      },
    });
  },
  comments(parent, _, { prisma }, _1) {
    return prisma.comment.findMany({
      where: {
        post: { id: parent.id },
      },
    });
  },
};

export default Post;
